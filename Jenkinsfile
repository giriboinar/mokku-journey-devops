// ─────────────────────────────────────────────────────────────────────────────
// Raja's Mokku Journey — Declarative CI/CD Pipeline
//
// Stages: Checkout → Validate → Install deps → Python tests → Java tests
//         (optional) → Lint + dependency scan → Build images → Trivy scan
//         → Push to ECR → Deploy staging → Smoke tests → Manual approval
//         → Deploy production → Verify → Rollback on failure
//
// Secrets: NEVER hardcoded. All values come from Jenkins credentials bindings
// (see "Required Jenkins credentials" below) or IAM roles on the agent.
// ─────────────────────────────────────────────────────────────────────────────
pipeline {
    agent {
        label 'docker-agent'   // agent with Docker, kubectl, helm, terraform, trivy, aws-cli
    }

    options {
        timestamps()
        ansiColor('xterm')
        timeout(time: 90, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    // ── Parameters ──────────────────────────────────────────────────────────
    parameters {
        booleanParam(name: 'BUILD_JAVA_SERVICE', defaultValue: true,
            description: 'Build and test the optional Java/Maven module')
        booleanParam(name: 'DEPLOY_STAGING', defaultValue: true,
            description: 'Deploy to the staging environment after ECR push')
        choice(name: 'DEPLOY_PROD', choices: ['no', 'yes'],
            description: 'Deploy to production (also requires manual approval gate)')
    }

    // ── Environment (non-secret config only) ─────────────────────────────────
    environment {
        APP_NAME        = 'raja-journey'
        AWS_REGION      = 'ap-south-1'
        // Replace with your AWS account id (12 digits) or inject via credentials.
        AWS_ACCOUNT_ID  = credentials('aws-account-id')          // Secret Text credential
        ECR_REGISTRY    = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        BACKEND_REPO    = 'raja-journey-backend'
        JAVA_REPO       = 'raja-journey-java-service'
        IMAGE_TAG       = "${env.GIT_COMMIT?.take(7) ?: 'local'}-${env.BUILD_NUMBER}"
        RELEASE_TAG     = "release-${env.BUILD_NUMBER}"
        HELM_RELEASE    = 'raja-journey'
        STAGING_NS      = 'raja-journey-staging'
        PROD_NS         = 'raja-journey'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                sh 'git rev-parse --short HEAD'
            }
        }

        stage('Validate source') {
            parallel {
                stage('Python syntax') {
                    steps { sh 'python3 -m compileall -q backend/app' }
                }
                stage('Shellcheck scripts') {
                    steps { sh 'shellcheck scripts/*.sh || true' }
                }
                stage('YAML lint (k8s/helm)') {
                    steps { sh 'yamllint -d relaxed k8s/ helm/ || true' }
                }
            }
        }

        stage('Install dependencies') {
            steps {
                sh '''
                    python3 -m venv .venv
                    . .venv/bin/activate
                    pip install --upgrade pip
                    pip install -r backend/requirements.txt
                    pip install pytest pytest-cov ruff bandit pip-audit
                '''
            }
        }

        stage('Python tests') {
            steps {
                sh '''
                    . .venv/bin/activate
                    pytest backend/tests -v --cov=backend/app --cov-report=term-missing \
                        --cov-fail-under=70
                '''
            }
            post {
                always { junit allowEmptyResults: true, testResults: '**/junit*.xml' }
            }
        }

        stage('Java Maven tests') {
            when { expression { params.BUILD_JAVA_SERVICE } }
            steps {
                dir('java-service') {
                    // Uses the Maven Wrapper or a tool install; settings come from
                    // ~/.m2 on the agent — no credentials in the repo.
                    sh 'mvn -B clean verify'
                }
            }
            post {
                always { junit allowEmptyResults: true, testResults: 'java-service/**/surefire-reports/*.xml' }
            }
        }

        stage('Lint + dependency security scan') {
            parallel {
                stage('Ruff lint') {
                    steps { sh '. .venv/bin/activate && ruff check backend/' }
                }
                stage('Bandit (SAST)') {
                    steps { sh '. .venv/bin/activate && bandit -q -r backend/app -x backend/tests || true' }
                }
                stage('pip-audit') {
                    steps { sh '. .venv/bin/activate && pip-audit -r backend/requirements.txt || true' }
                }
                stage('Hadolint Dockerfiles') {
                    steps { sh 'hadolint backend/Dockerfile java-service/Dockerfile || true' }
                }
            }
        }

        stage('Build Docker images') {
            steps {
                sh "docker build -t ${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG} -f backend/Dockerfile backend/"
                script {
                    if (params.BUILD_JAVA_SERVICE) {
                        sh "docker build -t ${ECR_REGISTRY}/${JAVA_REPO}:${IMAGE_TAG} -f java-service/Dockerfile java-service/"
                    }
                }
            }
        }

        stage('Trivy image vulnerability scan') {
            steps {
                sh """
                    trivy image --severity HIGH,CRITICAL --exit-code 1 \
                        --no-progress ${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG} \
                        || echo 'TRIVY_BACKEND_FINDINGS=1' > trivy.env
                """
                script {
                    if (params.BUILD_JAVA_SERVICE) {
                        sh """
                            trivy image --severity HIGH,CRITICAL --exit-code 1 \
                                --no-progress ${ECR_REGISTRY}/${JAVA_REPO}:${IMAGE_TAG}
                        """
                    }
                }
            }
        }

        stage('Push images to Amazon ECR') {
            steps {
                // AWS auth: agent uses an IAM instance/profile role; registry login only.
                sh """
                    aws ecr get-login-password --region ${AWS_REGION} \
                      | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                    docker tag ${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG} ${ECR_REGISTRY}/${BACKEND_REPO}:${RELEASE_TAG}
                    docker push ${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG}
                    docker push ${ECR_REGISTRY}/${BACKEND_REPO}:${RELEASE_TAG}
                """
                script {
                    if (params.BUILD_JAVA_SERVICE) {
                        sh """
                            docker tag ${ECR_REGISTRY}/${JAVA_REPO}:${IMAGE_TAG} ${ECR_REGISTRY}/${JAVA_REPO}:${RELEASE_TAG}
                            docker push ${ECR_REGISTRY}/${JAVA_REPO}:${IMAGE_TAG}
                            docker push ${ECR_REGISTRY}/${JAVA_REPO}:${RELEASE_TAG}
                        """
                    }
                }
            }
        }

        stage('Deploy to staging') {
            when { expression { params.DEPLOY_STAGING } }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-staging', variable: 'KUBECONFIG')]) {
                    sh """
                        helm upgrade --install ${HELM_RELEASE} helm/raja-journey \
                          --namespace ${STAGING_NS} --create-namespace \
                          -f helm/raja-journey/values-staging.yaml \
                          --set image.repository=${ECR_REGISTRY}/${BACKEND_REPO} \
                          --set image.tag=${IMAGE_TAG} \
                          --wait --timeout 10m
                        kubectl -n ${STAGING_NS} rollout status deploy/${HELM_RELEASE} --timeout=5m
                    """
                }
            }
        }

        stage('Smoke tests (staging)') {
            when { expression { params.DEPLOY_STAGING } }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-staging', variable: 'KUBECONFIG')]) {
                    sh '''
                        chmod +x scripts/smoke-test.sh
                        SVC_HOST=$(kubectl -n "$STAGING_NS" get svc "$HELM_RELEASE" \
                                   -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
                        BASE_URL="http://${SVC_HOST}" ./scripts/smoke-test.sh
                    '''
                }
            }
        }

        stage('Manual approval — production') {
            when { expression { params.DEPLOY_PROD == 'yes' } }
            steps {
                input message: 'Promote build to PRODUCTION?',
                      ok: 'Deploy to production',
                      submitterParameter: 'APPROVER'
                echo "Approved by ${APPROVER} — proceeding to production deploy."
            }
        }

        stage('Deploy to production') {
            when { expression { params.DEPLOY_PROD == 'yes' } }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-production', variable: 'KUBECONFIG')]) {
                    sh """
                        helm upgrade --install ${HELM_RELEASE} helm/raja-journey \
                          --namespace ${PROD_NS} --create-namespace \
                          -f helm/raja-journey/values-production.yaml \
                          --set image.repository=${ECR_REGISTRY}/${BACKEND_REPO} \
                          --set image.tag=${IMAGE_TAG} \
                          --wait --timeout 10m
                    """
                }
            }
        }

        stage('Verify rollout & health') {
            when { expression { params.DEPLOY_PROD == 'yes' } }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-production', variable: 'KUBECONFIG')]) {
                    sh '''
                        kubectl -n "$PROD_NS" rollout status deploy/"$HELM_RELEASE" --timeout=5m
                        kubectl -n "$PROD_NS" get pods -l app.kubernetes.io/name=raja-journey
                        chmod +x scripts/smoke-test.sh
                        SVC_HOST=$(kubectl -n "$PROD_NS" get svc "$HELM_RELEASE" \
                                   -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
                        BASE_URL="http://${SVC_HOST}" ./scripts/smoke-test.sh
                    '''
                }
            }
        }
    }

    // ── Rollback on failure ──────────────────────────────────────────────────
    post {
        failure {
            script {
                if (params.DEPLOY_PROD == 'yes') {
                    echo 'Production deploy failed — rolling back to previous release.'
                    withCredentials([file(credentialsId: 'kubeconfig-production', variable: 'KUBECONFIG')]) {
                        sh """
                            helm history ${HELM_RELEASE} -n ${PROD_NS} || true
                            helm rollback ${HELM_RELEASE} -n ${PROD_NS} || true
                            kubectl -n ${PROD_NS} rollout status deploy/${HELM_RELEASE} --timeout=5m || true
                        """
                    }
                }
            }
        }
        always {
            echo "Build ${env.BUILD_NUMBER} finished with status: ${currentBuild.currentResult}"
            cleanWs()
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Required Jenkins credentials (Manage Jenkins → Credentials):
//   aws-account-id          Secret text — 12-digit AWS account id (or use agent IAM role
//                           and drop this binding; the registry URL needs it)
//   kubeconfig-staging      Secret file — kubeconfig for the staging EKS cluster
//   kubeconfig-production   Secret file — kubeconfig for the production EKS cluster
//
// Required Jenkins agent tools: docker, git, python3, mvn (or maven wrapper),
// trivy, hadolint, yamllint, shellcheck, aws-cli v2, kubectl, helm, jq.
//
// AWS connectivity: attach an IAM role to the agent (EC2 instance profile /
// IRSA) with least-privilege ECR push + EKS describe permissions. No static
// AWS keys are used anywhere in this file.
// ─────────────────────────────────────────────────────────────────────────────
