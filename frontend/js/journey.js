/* =========================================================================
 * Raja's Mokku Journey — embedded stage data (fallback when /api/stages
 * is unreachable). Mirrors the backend journey content. Each stage has
 * English + Telugu titles and descriptions, an illustration path, alt
 * text, and a motion hint for CSS accents.
 * ========================================================================= */
(function (global) {
  'use strict';

  var IMG = 'assets/images/stage-';

  var STAGES = [
    {
      id: 1,
      image: IMG + '01.jpg',
      motion: 'float',
      tag_en: 'Muddanur · Home',
      tag_te: 'ముద్దనూరు · ఇల్లు',
      title_en: 'The B.Tech Triumph',
      title_te: 'బి.టెక్ విజయోత్సవం',
      desc_en: 'Raja holds his B.Tech degree certificate with a heart full of joy. As he celebrates, he remembers the vow he made: if he passed his B.Tech, he would visit Tirumala and offer his hair to Lord Venkateswara Swamy. Today, that promise begins its journey.',
      desc_te: 'రాజా తన బి.టెక్ పట్టాను చేతిలో పట్టుకుని ఆనందంతో నిండిపోయాడు. ఆ సంతోషంలోనే తను దేవుడికి ఇచ్చిన మొక్కును గుర్తుచేసుకున్నాడు. బి.టెక్ పాసైతే తిరుమల వెళ్లి శ్రీ వేంకటేశ్వర స్వామికి తలనీలాలు సమర్పిస్తానని మొక్కుకున్నాడు. ఈరోజు ఆ మొక్కు నెరవేరే ప్రయాణం మొదలవుతోంది.',
      alt_en: 'Anime-style illustration of Raja celebrating his B.Tech graduation, holding his degree certificate with a joyful expression.',
      alt_te: 'తన బి.టెక్ పట్టాను పట్టుకుని ఆనందంతో జరుపుకుంటున్న రాజా యానిమే-శైలి చిత్రం.'
    },
    {
      id: 2,
      image: IMG + '02.jpg',
      motion: 'float',
      tag_en: 'Muddanur · Village',
      tag_te: 'ముద్దనూరు · గ్రామం',
      title_en: 'Muddanur — Home Village',
      title_te: 'ముద్దనూరు — స్వగ్రామం',
      desc_en: 'In his native village of Muddanur, Raja packs his backpack for the sacred pilgrimage. He checks his railway ticket and travel essentials as the morning sun rises over the fields. With his family\u2019s blessings, he sets out to fulfil his vow.',
      desc_te: 'తన స్వగ్రామం ముద్దనూరులో రాజా పవిత్ర యాత్ర కోసం బ్యాగు సర్దుకుంటున్నాడు. పొలాల మీద ఉదయ సూర్యుడు ఉదయిస్తుండగా రైలు టికెట్టు, ప్రయాణ సామాను సరిచూసుకున్నాడు. కుటుంబ సభ్యుల ఆశీస్సులతో మొక్కు తీర్చుకోవడానికి బయలుదేరాడు.',
      alt_en: 'Anime-style illustration of Raja packing his backpack in his village home in Muddanur at sunrise, railway ticket in hand.',
      alt_te: 'సూర్యోదయ సమయంలో ముద్దనూరులోని తన ఇంట్లో బ్యాగు సర్దుకుంటున్న రాజా యానిమే-శైలి చిత్రం.'
    },
    {
      id: 3,
      image: IMG + '03.jpg',
      motion: 'float',
      tag_en: 'Muddanur Railway Station',
      tag_te: 'ముద్దనూరు రైల్వే స్టేషన్',
      title_en: 'Muddanur Railway Station',
      title_te: 'ముద్దనూరు రైల్వే స్టేషన్',
      desc_en: 'Raja arrives at Muddanur Railway Station, ticket in hand. The platform sign reads \u201CMUDDANUR\u201D as an Indian Railways passenger train pulls in. He walks toward the general coach, his heart beating with devotion and excitement.',
      desc_te: '\u2018ముద్దనూరు\u2019 అనే బోర్డు ఉన్న ప్లాట్‌ఫారమ్‌పై రాజా టికెట్టు చేతిలో పట్టుకుని నిలబడ్డాడు. ప్రయాణికుల రైలు రాగానే జనరల్ బోగీ వైపు నడిచాడు. భక్తితో, ఉత్సాహంతో అతని హృదయం వేగంగా కొట్టుకుంటోంది.',
      alt_en: 'Anime-style illustration of Muddanur railway station with a platform sign reading MUDDANUR and an Indian Railways passenger train arriving.',
      alt_te: '\u2018ముద్దనూరు\u2019 బోర్డు, ప్రయాణికుల రైలుతో ముద్దనూరు రైల్వే స్టేషన్ యానిమే-శైలి చిత్రం.'
    },
    {
      id: 4,
      image: IMG + '04.jpg',
      motion: 'train',
      tag_en: 'Muddanur \u2192 Tirupati',
      tag_te: 'ముద్దనూరు \u2192 తిరుపతి',
      title_en: 'Train Journey to Tirupati',
      title_te: 'తిరుపతికి రైలు ప్రయాణం',
      desc_en: 'Raja boards the general coach as the train begins its journey from Muddanur to Tirupati. Green fields, villages, and electric poles glide past the window as daylight shifts across the countryside. Every mile brings him closer to the Lord.',
      desc_te: 'ముద్దనూరు నుండి తిరుపతికి రైలు బయలుదేరగానే రాజా జనరల్ బోగీలో ఎక్కాడు. కిటికీలోంచి పచ్చని పొలాలు, గ్రామాలు, విద్యుత్ స్తంభాలు దాటిపోతున్నాయి. ప్రతి మైలు అతన్ని స్వామి వారికి మరింత దగ్గర చేస్తోంది.',
      alt_en: 'Anime-style illustration of Raja looking out of a moving train window at passing green fields and villages on the way to Tirupati.',
      alt_te: 'తిరుపతికి వెళ్తున్న రైలు కిటికీలోంచి పొలాలను చూస్తున్న రాజా యానిమే-శైలి చిత్రం.'
    },
    {
      id: 5,
      image: IMG + '05.jpg',
      motion: 'float',
      tag_en: 'Tirupati Railway Station',
      tag_te: 'తిరుపతి రైల్వే స్టేషన్',
      title_en: 'Arrival at Tirupati',
      title_te: 'తిరుపతికి చేరుకోవడం',
      desc_en: 'The train pulls into Tirupati Railway Station. Raja steps down with his backpack, looking toward the distant hills with folded hope. His vow feels closer than ever as the temple town welcomes him.',
      desc_te: 'రైలు తిరుపతి రైల్వే స్టేషన్‌కు చేరుకుంది. రాజా బ్యాగుతో దిగి దూరంగా కనిపిస్తున్న కొండల వైపు ఆశతో చూశాడు. ఆలయ నగరం అతన్ని ఆహ్వానిస్తుండగా మొక్కు ఇంకా దగ్గరైనట్లు అనిపించింది.',
      alt_en: 'Anime-style illustration of Raja stepping off the train at Tirupati railway station, gazing toward the distant Tirumala hills.',
      alt_te: 'తిరుపతి రైల్వే స్టేషన్‌లో రైలు దిగి దూరపు కొండల వైపు చూస్తున్న రాజా యానిమే-శైలి చిత్రం.'
    },
    {
      id: 6,
      image: IMG + '06.jpg',
      motion: 'float',
      tag_en: 'Tirupati \u2192 Srivari Mettu',
      tag_te: 'తిరుపతి \u2192 శ్రీవారి మెట్టు',
      title_en: 'Auto-Rickshaw to Srivari Mettu',
      title_te: 'శ్రీవారి మెట్టుకు ఆటో ప్రయాణం',
      desc_en: 'Raja hops into an auto-rickshaw heading for the Srivari Mettu trekking entrance. The road winds through green surroundings and busy streets, signboards pointing the way. On the horizon, the sacred Tirumala hills rise in the distance.',
      desc_te: 'శ్రీవారి మెట్టు నడక మార్గం ప్రవేశం వైపు రాజా ఆటో ఎక్కాడు. పచ్చని పరిసరాలు, రద్దీ వీధుల గుండా రోడ్డు సాగుతోంది, దారి చూపే బోర్డులు కనిపిస్తున్నాయి. దూరంగా పవిత్ర తిరుమల కొండలు కనిపిస్తున్నాయి.',
      alt_en: 'Anime-style illustration of Raja riding in an Indian auto-rickshaw toward Srivari Mettu, with Tirumala hills visible in the distance.',
      alt_te: 'శ్రీవారి మెట్టు వైపు ఆటోలో వెళ్తున్న రాజా, దూరంగా తిరుమల కొండలతో యానిమే-శైలి చిత్రం.'
    },
    {
      id: 7,
      image: IMG + '07.jpg',
      motion: 'climb',
      tag_en: 'Srivari Mettu',
      tag_te: 'శ్రీవారి మెట్టు',
      title_en: 'Srivari Mettu Entrance',
      title_te: 'శ్రీవారి మెట్టు ప్రవేశం',
      desc_en: 'Raja arrives at the Srivari Mettu entrance, the sacred footpath to Tirumala. He pauses at the signboard, joins fellow pilgrims, and begins climbing the ancient stone steps. Each step is a prayer; each breath, devotion.',
      desc_te: 'తిరుమలకు పవిత్ర నడక మార్గమైన శ్రీవారి మెట్టు ప్రవేశానికి రాజా చేరుకున్నాడు. బోర్డు వద్ద ఆగి, తోటి యాత్రికులతో కలిసి పురాతన రాతి మెట్లు ఎక్కడం మొదలుపెట్టాడు. ప్రతి మెట్టు ఒక ప్రార్థన, ప్రతి శ్వాస భక్తి.',
      alt_en: 'Anime-style illustration of Raja at the Srivari Mettu entrance signboard, beginning to climb stone steps surrounded by forest with fellow pilgrims.',
      alt_te: 'శ్రీవారి మెట్టు బోర్డు వద్ద రాతి మెట్లు ఎక్కడం మొదలుపెట్టిన రాజా యానిమే-శైలి చిత్రం.'
    },
    {
      id: 8,
      image: IMG + '08.jpg',
      motion: 'climb',
      tag_en: 'The Seven Hills',
      tag_te: 'ఏడు కొండలు',
      title_en: 'Climbing the Seven Hills',
      title_te: 'ఏడు కొండలు ఎక్కడం',
      desc_en: 'Raja climbs the seven sacred hills of Tirumala, resting at shaded points along the way. Sunlight filters through the forest as pilgrims walk respectfully beside him. Tired but determined, his devotion carries him upward \u2014 hill by hill, milestone by milestone.',
      desc_te: 'రాజా తిరుమల ఏడు పవిత్ర కొండలు ఎక్కుతున్నాడు, దారిలో నీడ ఉన్న చోట్ల విశ్రమిస్తున్నాడు. అడవిలోంచి సూర్యకిరణాలు జారుతుండగా యాత్రికులు భక్తితో నడుస్తున్నారు. అలసిపోయినా దృఢ సంకల్పంతో, భక్తే అతన్ని పైకి నడిపిస్తోంది \u2014 కొండ కొండకూ, మైలురాయి మైలురాయికీ.',
      alt_en: 'Anime-style illustration of Raja climbing stone steps up forested Tirumala hills, sunlight filtering through trees, with fellow pilgrims.',
      alt_te: 'అడవి కొండలపై రాతి మెట్లు ఎక్కుతున్న రాజా యానిమే-శైలి చిత్రం.',
      milestones: true
    },
    {
      id: 9,
      image: IMG + '09.jpg',
      motion: 'float',
      tag_en: 'Tirumala',
      tag_te: 'తిరుమల',
      title_en: 'Entering Tirumala',
      title_te: 'తిరుమల ప్రవేశం',
      desc_en: 'Raja reaches the top \u2014 Tirumala, the abode of Lord Venkateswara. Hilltop signboards, greenery, and pilgrim facilities surround him in the cool mountain air. Tears of gratitude fill his eyes: the climb is complete.',
      desc_te: 'రాజా శిఖరం చేరుకున్నాడు \u2014 శ్రీ వేంకటేశ్వర స్వామి నిలయమైన తిరుమల. చల్లని పర్వత గాలిలో కొండపై బోర్డులు, పచ్చదనం, యాత్రికుల సౌకర్యాలు అతన్ని చుట్టుముట్టాయి. కృతజ్ఞతతో కళ్ళు చెమర్చాయి: ఎక్కడం పూర్తయింది.',
      alt_en: 'Anime-style illustration of Raja arriving at hilltop Tirumala, emotional and grateful, with temple town scenery around him.',
      alt_te: 'కొండపై తిరుమలకు చేరుకుని కృతజ్ఞతతో ఉన్న రాజా యానిమే-శైలి చిత్రం.'
    },
    {
      id: 10,
      image: IMG + '10.jpg',
      motion: 'float',
      tag_en: 'Kalyanakatta',
      tag_te: 'కళ్యాణకట్ట',
      title_en: 'Kalyanakatta \u2014 The Tonsure Vow',
      title_te: 'కళ్యాణకట్ట \u2014 తలనీలాల సమర్పణ',
      desc_en: 'At the Kalyanakatta tonsure hall, Raja waits patiently among fellow devotees. Seated with humility, he offers his hair to Lord Venkateswara Swamy, fulfilling the vow he made before his B.Tech results. He emerges with a shaved head, peaceful and grateful.',
      desc_te: 'కళ్యాణకట్ట తలనీలాల మందిరంలో రాజా తోటి భక్తులతో ఓపికగా వేచి ఉన్నాడు. వినయంతో కూర్చుని, బి.టెక్ ఫలితాలకు ముందు మొక్కుకున్నట్లుగా శ్రీ వేంకటేశ్వర స్వామికి తన తలనీలాలు సమర్పించాడు. తల గుండు చేయించుకుని శాంతితో, కృతజ్ఞతతో బయటకు వచ్చాడు.',
      alt_en: 'Respectful anime-style illustration of Raja seated in the Kalyanakatta tonsure hall, and afterwards with a shaved head looking peaceful.',
      alt_te: 'కళ్యాణకట్ట మందిరంలో కూర్చున్న రాజా, ఆ తర్వాత గుండుతో శాంతిగా ఉన్న యానిమే-శైలి చిత్రం.'
    },
    {
      id: 11,
      image: IMG + '11.jpg',
      motion: 'float',
      tag_en: 'Sarva Darshan Queue',
      tag_te: 'సర్వదర్శనం క్యూ',
      title_en: 'The Free Darshan Queue',
      title_te: 'ఉచిత దర్శనం క్యూ',
      desc_en: 'With his head shaved and heart light, Raja joins the free Sarva Darshan queue. He moves patiently through the compartments, past security checks and fellow pilgrims. Devotional anticipation fills the air as the queue inches toward the temple.',
      desc_te: 'తలనీలాలు సమర్పించి, తేలికైన హృదయంతో రాజా ఉచిత సర్వదర్శనం క్యూలో చేరాడు. భద్రతా తనిఖీలు, తోటి యాత్రికుల మధ్య ఓపికగా క్యూలో ముందుకు సాగాడు. ఆలయం వైపు క్యూ కదులుతుండగా భక్తిపూరితమైన నిరీక్షణ గాలిలో నిండిపోయింది.',
      alt_en: 'Anime-style illustration of Raja with a shaved head waiting patiently in the free Sarva Darshan queue compartments with fellow pilgrims.',
      alt_te: 'ఉచిత సర్వదర్శనం క్యూలో ఓపికగా వేచి ఉన్న రాజా యానిమే-శైలి చిత్రం.'
    },
    {
      id: 12,
      image: IMG + '12.jpg',
      motion: 'float',
      tag_en: 'Temple Entrance',
      tag_te: 'ఆలయ ప్రవేశం',
      title_en: 'Temple Entrance',
      title_te: 'ఆలయ ప్రవేశం',
      desc_en: 'Raja approaches the sacred entrance of the Sri Venkateswara Swamy temple. Ancient gopurams and carved stonework rise before him in the warm temple light. He walks through the darshan areas with folded hands, his devotion deepening with every step.',
      desc_te: 'రాజా శ్రీ వేంకటేశ్వర స్వామి ఆలయ పవిత్ర ప్రవేశం వైపు నడిచాడు. ఆలయ వెలుగులో పురాతన గోపురాలు, శిల్పకళ అతని ముందు ఎత్తుగా నిలిచాయి. చేతులు జోడించి దర్శన ప్రాంగణాల గుండా నడిచాడు, ప్రతి అడుగుతో భక్తి మరింత లోతైంది.',
      alt_en: 'Anime-style illustration of Raja approaching the Sri Venkateswara Swamy temple entrance with gopurams, hands folded in prayer.',
      alt_te: 'చేతులు జోడించి ఆలయ ప్రవేశం వైపు నడుస్తున్న రాజా యానిమే-శైలి చిత్రం.'
    },
    {
      id: 13,
      image: IMG + '13.jpg',
      motion: 'float',
      tag_en: 'Main Darshan',
      tag_te: 'ముఖ్య దర్శనం',
      title_en: 'Darshan of Lord Venkateswara',
      title_te: 'శ్రీ వేంకటేశ్వర స్వామి దర్శనం',
      desc_en: 'The moment of fulfilment. Raja stands in the authorised darshan area, head shaved, hands joined in prayer, eyes filled with gratitude as he beholds Lord Venkateswara Swamy. Temple lamps glow around him. His B.Tech vow is complete \u2014 Govinda! Govinda!',
      desc_te: 'మొక్కు నెరవేరిన క్షణం. రాజా అనుమతించిన దర్శన ప్రాంతంలో నిలబడి, తల గుండుతో, చేతులు జోడించి, కృతజ్ఞతతో నిండిన కళ్ళతో శ్రీ వేంకటేశ్వర స్వామిని దర్శించుకున్నాడు. చుట్టూ ఆలయ దీపాలు వెలుగుతున్నాయి. అతని బి.టెక్ మొక్కు పూర్తయింది \u2014 గోవిందా! గోవిందా!',
      alt_en: 'Reverent anime-style illustration of Raja with a shaved head, hands joined in prayer, beholding Lord Venkateswara Swamy in the temple during darshan.',
      alt_te: 'చేతులు జోడించి శ్రీ వేంకటేశ్వర స్వామిని దర్శించుకుంటున్న రాజా యానిమే-శైలి చిత్రం.',
      caption_en: 'Artistic reconstruction \u2014 not temple photography.',
      caption_te: 'కళాత్మక పునర్నిర్మాణం \u2014 ఆలయ ఛాయాచిత్రం కాదు.'
    },
    {
      id: 14,
      image: IMG + '14.jpg',
      motion: 'float',
      tag_en: 'Laddu Prasadam',
      tag_te: 'లడ్డూ ప్రసాదం',
      title_en: 'Tirumala Laddu Prasadam',
      title_te: 'తిరుమల లడ్డూ ప్రసాదం',
      desc_en: '\u201CMy vow is fulfilled. I received the blessings of Lord Venkateswara Swamy.\u201D At the laddu prasadam counter, Raja respectfully receives the sacred Tirumala laddu. He holds the blessed prasadam close \u2014 a sweet reminder of a promise kept.',
      desc_te: '\u2018నా మొక్కు నెరవేరింది. శ్రీ వేంకటేశ్వర స్వామి వారి ఆశీస్సులు పొందాను.\u2019 లడ్డూ ప్రసాదం కౌంటర్ వద్ద రాజా పవిత్ర తిరుమల లడ్డూను భక్తితో స్వీకరించాడు. నెరవేర్చిన వాగ్దానానికి తీపి గుర్తుగా ఆశీర్వదించబడిన ప్రసాదాన్ని గుండెకు హత్తుకున్నాడు.',
      alt_en: 'Anime-style illustration of Raja respectfully receiving and holding Tirumala laddu prasadam at the distribution counter.',
      alt_te: 'లడ్డూ ప్రసాదం కౌంటర్ వద్ద ప్రసాదం స్వీకరిస్తున్న రాజా యానిమే-శైలి చిత్రం.'
    },
    {
      id: 15,
      image: IMG + '15.jpg',
      motion: 'train',
      tag_en: 'Tirupati \u2192 Muddanur',
      tag_te: 'తిరుపతి \u2192 ముద్దనూరు',
      title_en: 'Return Journey',
      title_te: 'తిరుగు ప్రయాణం',
      desc_en: 'With prasadam in hand and peace in his heart, Raja heads back to Tirupati Railway Station. He boards the train home as the hills fade behind him. The pilgrimage atmosphere gives way to the warmth of homecoming.',
      desc_te: 'చేతిలో ప్రసాదం, హృదయంలో శాంతితో రాజా తిరుపతి రైల్వే స్టేషన్‌కు తిరిగి వచ్చాడు. కొండలు వెనుక మసకబారుతుండగా ఇంటికి రైలు ఎక్కాడు. యాత్రా వాతావరణం స్వగృహ ఆగమనపు వెచ్చదనానికి దారి ఇచ్చింది.',
      alt_en: 'Anime-style illustration of Raja boarding the train back home from Tirupati, holding laddu prasadam, hills fading in the distance.',
      alt_te: 'ప్రసాదంతో తిరుపతి నుండి ఇంటికి రైలు ఎక్కుతున్న రాజా యానిమే-శైలి చిత్రం.'
    },
    {
      id: 16,
      image: IMG + '16.jpg',
      motion: 'float',
      tag_en: 'Muddanur · Homecoming',
      tag_te: 'ముద్దనూరు · స్వాగతం',
      title_en: 'Homecoming \u2014 Muddanur',
      title_te: 'స్వగ్రామానికి తిరిగి రావడం \u2014 ముద్దనూరు',
      desc_en: 'Raja arrives back in Muddanur, laddu prasadam in hand and unforgettable memories in his heart. He smiles peacefully, grateful for the journey. \u201CB.Tech Dream Achieved. Mokku Fulfilled. Govinda Govinda!\u201D',
      desc_te: 'రాజా ముద్దనూరుకు తిరిగి వచ్చాడు, చేతిలో లడ్డూ ప్రసాదం, హృదయంలో మరపురాని జ్ఞాపకాలు. శాంతిగా చిరునవ్వుతో, యాత్రకు కృతజ్ఞతతో ఉన్నాడు. \u201Cశ్రీ వేంకటేశ్వర స్వామి వారి ఆశీస్సులతో రాజా తన మొక్కును పూర్తి చేసుకున్నాడు. గోవిందా! గోవిందా!\u201D',
      alt_en: 'Anime-style illustration of Raja smiling peacefully back home in Muddanur, holding Tirumala laddu prasadam.',
      alt_te: 'లడ్డూ ప్రసాదంతో ముద్దనూరులో శాంతిగా నవ్వుతున్న రాజా యానిమే-శైలి చిత్రం.'
    }
  ];

  global.RAJA_JOURNEY = { stages: STAGES, count: STAGES.length };
})(typeof window !== 'undefined' ? window : this);
