document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://127.0.0.1:8000/predict";
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);
  let lang = "en", crop = "All", img = null;

  /* ---------- Text (English / Hindi) ---------- */
  const T = {
    en: {
      lang: "हिंदी", dashboard: "Dashboard", analyze: "Analyze Plant", guide: "Disease & Treatment Guide", tips: "Tips & Prevention",
      brandSub: "Plant Health & Treatment Advisory", sideTitle: "🌱 Plant health matters",
      sideText: "Upload a clear leaf photograph to check for a possible disease and explore care recommendations.",
      model: "Model: MobileNetV2 (planned integration)", theme: "🌙 Theme",
      welcome: "WELCOME TO LEAFCARE 🌱", heading: "Let's keep your plants healthy.",
      intro: "Explore plant diseases, upload leaf photographs, and learn about possible treatments.",
      check: "Check your plant", choose: "Choose a leaf photograph to begin.", start: "＋ Analyze a Plant",
      st1: "Supported disease classes", st2: "Supported crops", st3: "Analyses attempted",
      tag1: "🌿 SIMPLE & SMART", how: "How LeafCare Works", howSub: "From a leaf photo to healthier plants in four simple steps.", step: "STEP",
      s1t: "Capture", s1d: "Upload a clear photograph of your plant leaf.",
      s2t: "Analyze", s2d: "Our connected AI model predicts a possible condition.",
      s3t: "Understand", s3d: "Review the confidence score and care recommendations.",
      s4t: "Take Action", s4d: "Follow suitable prevention and plant-care practices.",
      tag2: "🌱 YOUR PLANT JOURNEY", recent: "Recent Activity", recentSub: "Keep track of your plant health analyses.",
      total: "Total analyses", noHistory: "🌿 No analyses yet. Your plant scans will appear here.", clear: "Clear History",
      aHead: "Analyze Plant", aIntro: "Upload a leaf photograph for analysis by your connected model.",
      upload: "🍃 Upload a leaf image", uploadHelp: "Use a clear photograph with one leaf in focus.",
      noImage: "No image selected.", analyzeBtn: "Analyze leaf", result: "Analysis result",
      notice: "The Analyze button connects to http://127.0.0.1:8000/predict. You must run your own compatible FastAPI model backend for real predictions.",
      gHead: "Disease & Treatment Guide",
      gIntro: "Explore the supported potato and tomato conditions, their symptoms, treatment options, and prevention.",
      search: "Search by disease, crop, or symptom...", all: "All crops", potato: "🥔 Potato", tomato: "🍅 Tomato",
      tHead: "Treatment & Prevention Details",
      gNotice: "These are general educational recommendations, not a confirmed diagnosis. Before using pesticides or fungicides, verify the product, dosage, and safety precautions with a qualified local agriculture professional.",
      tipsHead: "Tips & Prevention", tipsIntro: "Good practices can help reduce the risk of many plant diseases.",
      footer: "LeafCare — Plant Disease Detection & Treatment Advisory System",
      selected: "Selected: ", noImageAlert: "Please choose a leaf image first.", invalid: "Please select an image file.",
      analyzing: "Analyzing...", error: "Could not analyze the image.",
      backendError: "Make sure your LeafCare backend is running at http://127.0.0.1:8000 and supports POST /predict.",
      conf: "Model confidence: ", view: "View guidance", noMatch: "No matching conditions found. Try another search.",
      about: "About:", symptoms: "Common symptoms:", treatment: "Treatment / care:", prevention: "Prevention:",
      general: "General guidance",
      guideAdvice: "Review the Disease & Treatment Guide for general information. This prediction needs careful interpretation."
    },
    hi: {
      lang: "English", dashboard: "डैशबोर्ड", analyze: "पौधे की जाँच", guide: "रोग एवं उपचार गाइड", tips: "सुझाव एवं बचाव",
      brandSub: "पौधों के स्वास्थ्य और उपचार संबंधी सलाह", sideTitle: "🌱 पौधों का स्वास्थ्य महत्वपूर्ण है",
      sideText: "संभावित रोग की जाँच और देखभाल के सुझाव पाने के लिए पत्ती की साफ तस्वीर अपलोड करें।",
      model: "मॉडल: MobileNetV2 (एकीकरण की योजना)", theme: "🌙 थीम",
      welcome: "लीफकेयर में आपका स्वागत है 🌱", heading: "आइए, अपने पौधों को स्वस्थ रखें।",
      intro: "पौधों के रोगों की जानकारी लें, पत्तियों की तस्वीर अपलोड करें और संभावित उपचार जानें।",
      check: "अपने पौधे की जाँच करें", choose: "शुरू करने के लिए पत्ती की तस्वीर चुनें।", start: "＋ पौधे की जाँच करें",
      st1: "समर्थित रोग श्रेणियाँ", st2: "समर्थित फसलें", st3: "किए गए विश्लेषण",
      tag1: "🌿 सरल और स्मार्ट", how: "लीफकेयर कैसे काम करता है", howSub: "पत्ती की तस्वीर से स्वस्थ पौधों तक, चार आसान चरणों में।", step: "चरण",
      s1t: "तस्वीर लें", s1d: "अपने पौधे की पत्ती की साफ तस्वीर अपलोड करें।",
      s2t: "जाँच करें", s2d: "हमारा जुड़ा हुआ AI मॉडल संभावित स्थिति का अनुमान लगाता है।",
      s3t: "समझें", s3d: "विश्वास स्कोर और देखभाल के सुझाव देखें।",
      s4t: "कदम उठाएँ", s4d: "उचित बचाव और पौधों की देखभाल के उपाय अपनाएँ।",
      tag2: "🌱 आपके पौधे की यात्रा", recent: "हाल की गतिविधि", recentSub: "अपने पौधों की स्वास्थ्य जाँच का रिकॉर्ड रखें।",
      total: "कुल जाँच", noHistory: "🌿 अभी तक कोई जाँच नहीं हुई। आपकी जाँच यहाँ दिखाई देंगी।", clear: "इतिहास साफ करें",
      aHead: "पौधे की जाँच", aIntro: "अपने जुड़े हुए मॉडल से जाँच कराने के लिए पत्ती की तस्वीर अपलोड करें।",
      upload: "🍃 पत्ती की तस्वीर अपलोड करें", uploadHelp: "एक पत्ती की साफ और स्पष्ट तस्वीर चुनें।",
      noImage: "कोई तस्वीर नहीं चुनी गई है।", analyzeBtn: "पत्ती की जाँच करें", result: "जाँच का परिणाम",
      notice: "जाँच का बटन आपके बैकएंड http://127.0.0.1:8000/predict से जुड़ता है। वास्तविक परिणामों के लिए FastAPI मॉडल बैकएंड चालू होना चाहिए।",
      gHead: "रोग एवं उपचार गाइड",
      gIntro: "आलू और टमाटर की फसलों की स्थितियों, लक्षणों, उपचार और बचाव के बारे में जानें।",
      search: "रोग, फसल या लक्षण खोजें...", all: "सभी फसलें", potato: "🥔 आलू", tomato: "🍅 टमाटर",
      tHead: "उपचार एवं बचाव की जानकारी",
      gNotice: "यह सामान्य शैक्षिक जानकारी है, पक्की बीमारी की पहचान नहीं। कीटनाशक या फफूंदनाशक इस्तेमाल करने से पहले स्थानीय कृषि विशेषज्ञ से उत्पाद, मात्रा और सुरक्षा संबंधी निर्देशों की पुष्टि करें।",
      tipsHead: "सुझाव एवं बचाव", tipsIntro: "अच्छी देखभाल से पौधों में कई रोगों का खतरा कम हो सकता है।",
      footer: "लीफकेयर — पौधों के रोगों की पहचान और देखभाल संबंधी सलाह",
      selected: "चुनी गई तस्वीर: ", noImageAlert: "कृपया पहले पत्ती की तस्वीर चुनें।", invalid: "कृपया तस्वीर वाली फ़ाइल चुनें।",
      analyzing: "तस्वीर की जाँच हो रही है...", error: "तस्वीर की जाँच नहीं हो सकी।",
      backendError: "जाँचें कि LeafCare बैकएंड http://127.0.0.1:8000 पर चल रहा है और POST /predict का समर्थन करता है।",
      conf: "मॉडल का विश्वास स्कोर: ", view: "सलाह देखें", noMatch: "इस खोज से मेल खाती स्थिति नहीं मिली। दूसरी खोज आज़माएँ।",
      about: "जानकारी:", symptoms: "सामान्य लक्षण:", treatment: "उपचार / देखभाल:", prevention: "बचाव:",
      general: "सामान्य सलाह",
      guideAdvice: "सामान्य जानकारी के लिए रोग एवं उपचार गाइड देखें। इस अनुमान का सावधानीपूर्वक मूल्यांकन करें।"
    }
  };

  const NAMES = {
    "Early Blight": "अर्ली ब्लाइट (प्रारंभिक झुलसा)", "Late Blight": "लेट ब्लाइट (पछेती झुलसा)", "Healthy": "स्वस्थ",
    "Leaf Mold": "पत्ती फफूंद रोग", "Mosaic Virus": "मोज़ेक वायरस", "Target Spot": "टारगेट स्पॉट (लक्ष्याकार धब्बे)"
  };
  const CROPS = { Potato: "आलू", Tomato: "टमाटर" };
  const EMOJI = { Potato: "🥔", Tomato: "🍅" };

  /* ---------- Disease knowledge base ---------- */
  const diseases = [
    {
      crop: "Potato", name: "Early Blight",
      symptoms: "Brown spots, often with concentric rings, on older leaves. Yellowing may appear around the spots.",
      about: "Early blight is a fungal disease associated with Alternaria species. Symptoms and severity can vary with weather and crop conditions.",
      treatment: ["Remove badly affected leaves where practical and dispose of infected plant material appropriately.", "Avoid wetting foliage when watering.", "If the disease continues to spread, ask a local agriculture professional about an approved fungicide and its label instructions."],
      prevention: ["Rotate crops where possible.", "Maintain suitable spacing and airflow.", "Avoid leaving infected plant debris around the crop."]
    },
    {
      crop: "Potato", name: "Late Blight",
      symptoms: "Water-soaked-looking dark patches that can enlarge quickly, sometimes with pale growth near lesion edges in humid conditions.",
      about: "Late blight is a serious disease caused by Phytophthora infestans. It can spread rapidly in cool, wet conditions.",
      treatment: ["Remove and dispose of affected plants according to local agricultural guidance.", "Avoid moving infected plant material through the field.", "Contact an agriculture officer promptly for locally approved disease-management advice."],
      prevention: ["Inspect crops regularly, especially during wet weather.", "Use healthy planting material and suitable resistant varieties where available.", "Follow local disease alerts and recommended crop-protection guidance."]
    },
    {
      crop: "Potato", name: "Healthy",
      symptoms: "Leaves generally have an even green colour and no obvious expanding lesions or unusual patterns.",
      about: "A healthy-looking leaf does not guarantee the entire plant is disease-free. Continue routine monitoring.",
      treatment: ["No disease treatment is indicated by appearance alone.", "Continue normal crop care and investigate any new symptoms."],
      prevention: ["Provide appropriate sunlight and watering.", "Maintain good soil drainage and nutrition.", "Inspect both sides of leaves regularly."]
    },
    {
      crop: "Tomato", name: "Healthy",
      symptoms: "Leaves generally show normal colour and growth without obvious disease lesions or abnormal patterns.",
      about: "Healthy-looking leaves are a positive sign, but regular plant monitoring is still important.",
      treatment: ["No disease treatment is indicated by appearance alone.", "Continue routine care and watch for changes."],
      prevention: ["Water near the soil instead of repeatedly wetting leaves.", "Provide suitable spacing and sunlight.", "Check plants regularly for pests and symptoms."]
    },
    {
      crop: "Tomato", name: "Leaf Mold",
      symptoms: "Yellowish patches on the upper leaf surface may occur with olive-green or brownish growth underneath in humid conditions.",
      about: "Tomato leaf mold is associated with the fungus Passalora fulva and is favoured by high humidity.",
      treatment: ["Remove heavily affected leaves when practical.", "Improve ventilation and avoid prolonged leaf wetness.", "Ask a local agriculture professional about approved control products if the disease persists."],
      prevention: ["Increase airflow between plants.", "Use watering practices that keep foliage as dry as practical.", "Manage greenhouse or growing-area humidity where possible."]
    },
    {
      crop: "Tomato", name: "Mosaic Virus",
      symptoms: "Mottled light and dark green leaf patterns, distortion, or unusual leaf growth may occur.",
      about: "Mosaic-like symptoms can be associated with plant viruses, but visual symptoms alone cannot confirm which virus is present.",
      treatment: ["There is generally no curative treatment for a plant once a viral infection is established.", "Isolate suspicious plants where practical and seek local agricultural guidance.", "Clean tools and handle plants carefully to reduce mechanical spread."],
      prevention: ["Use healthy seeds and planting material.", "Control relevant insect vectors when advised by local experts.", "Clean tools and wash hands after handling suspicious plants."]
    },
    {
      crop: "Tomato", name: "Target Spot",
      symptoms: "Circular brown leaf lesions may develop concentric rings, sometimes giving a target-like appearance.",
      about: "Target spot is associated with the fungus Corynespora cassiicola. Other conditions can produce similar spots.",
      treatment: ["Remove severely affected foliage where practical.", "Avoid overhead watering and improve airflow.", "Seek local advice about approved fungicides if the disease is spreading."],
      prevention: ["Inspect leaves regularly.", "Avoid excessive foliage wetness.", "Maintain suitable plant spacing and remove crop debris."]
    }
  ];

    const tips = [
    ["💧", "Water carefully", "Water near the soil and avoid repeatedly wetting leaves, especially late in the day.",
           "सावधानी से पानी दें", "पानी पौधे की जड़ के पास दें और पत्तियों को बार-बार गीला करने से बचें, खासकर दिन के आख़िरी समय में।"],
    ["☀️", "Provide suitable sunlight", "Follow the light requirements of your crop and avoid overcrowding plants.",
           "उचित धूप दें", "अपनी फसल की धूप संबंधी ज़रूरत का ध्यान रखें और पौधों को ज़्यादा पास-पास न लगाएँ।"],
    ["🔎", "Inspect leaves regularly", "Look at both sides of leaves and check for new spots, discolouration, or unusual growth.",
           "पत्तियों की नियमित जाँच करें", "पत्तियों के दोनों ओर देखें और नए धब्बे, रंग बदलना या असामान्य बढ़वार पर नज़र रखें।"],
    ["🌬️", "Improve airflow", "Suitable spacing can help foliage dry faster and reduce conditions favourable to some diseases.",
           "हवा का आवागमन बढ़ाएँ", "उचित दूरी रखने से पत्तियाँ जल्दी सूखती हैं और कुछ रोगों के लिए अनुकूल स्थितियाँ कम होती हैं।"],
    ["🧹", "Keep the growing area clean", "Remove diseased plant debris appropriately and clean tools between plants.",
           "उगाने की जगह साफ रखें", "रोगग्रस्त पौधों के अवशेष उचित तरीके से हटाएँ और एक पौधे से दूसरे पर जाने से पहले औज़ार साफ करें।"],
    ["🌱", "Use healthy planting material", "Choose healthy seeds or seedlings and use locally suitable varieties where available.",
           "स्वस्थ बीज और पौध इस्तेमाल करें", "स्वस्थ बीज या पौध चुनें और जहाँ उपलब्ध हों, स्थानीय रूप से उपयुक्त किस्में लगाएँ।"]
  ];

  /* ---------- Helpers ---------- */
  const t = () => T[lang];
  const cropName = c => lang === "hi" ? CROPS[c] : c;
  const diseaseName = n => lang === "hi" ? NAMES[n] || n : n;
  const ul = items => "<ul>" + items.map(i => `<li>${i}</li>`).join("") + "</ul>";
  const norm = s => s.toLowerCase().replace(/[_\s]+/g, " ").trim();

  const setMsg = () => $("#uploadMessage").textContent = img ? t().selected + img.name : t().noImage;
  const setBreadcrumb = () => $("#breadcrumb").textContent = $("nav .active span").textContent;
  const countScans = () => $("#scanCount").textContent = $("#activityCount").textContent = $$("#history li:not(.muted)").length;

  function i18n() {
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach(e => e.textContent = t()[e.dataset.i18n]);
    $("#searchInput").placeholder = t().search;
    setBreadcrumb();
    setMsg();
  }

  function renderGuide() {
    const q = $("#searchInput").value.toLowerCase().trim(), x = t();
    const list = diseases.filter(d =>
      (crop === "All" || d.crop === crop) &&
      [d.crop, d.name, d.symptoms, d.about, ...d.treatment, ...d.prevention].join(" ").toLowerCase().includes(q));

    $("#diseaseList").innerHTML = list.length ? list.map((d, i) => `
      <article class="disease-card">
        <div class="emoji">${EMOJI[d.crop]}</div>
        <p>${cropName(d.crop)}</p><h3>${diseaseName(d.name)}</h3><p>${d.symptoms}</p>
        <button class="primary" data-open="${i}">${x.view}</button>
      </article>`).join("") : `<p>${x.noMatch}</p>`;

    $("#treatmentList").innerHTML = list.map((d, i) => `
      <details id="d${i}">
        <summary>${cropName(d.crop)} — ${diseaseName(d.name)}</summary>
        <p><strong>${x.about}</strong> ${d.about}</p>
        <p><strong>${x.symptoms}</strong> ${d.symptoms}</p>
        <p><strong>${x.treatment}</strong></p>${ul(d.treatment)}
        <p><strong>${x.prevention}</strong></p>${ul(d.prevention)}
      </details>`).join("");

    $$("[data-open]").forEach(b => b.onclick = () => {
      const d = $("#d" + b.dataset.open);
      d.open = true;
      d.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
  function renderTips() {
    const i = lang === "hi" ? 3 : 1;   // position of the title in each tip (3 = Hindi, 1 = English)
    $("#tipsList").innerHTML = tips.map(tip =>
      `<article class="disease-card"><div class="emoji">${tip[0]}</div><h3>${tip[i]}</h3><p>${tip[i + 1]}</p></article>`
    ).join("");
  }
  function showPage(id) {
    $$(".page").forEach(p => p.classList.toggle("active", p.id === id));
    $$("nav button").forEach(b => b.classList.toggle("active", b.dataset.page === id));
    setBreadcrumb();
    $(".content").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- Events ---------- */
  $$("nav button").forEach(b => b.onclick = () => showPage(b.dataset.page));
  $("#startAnalyze").onclick = () => showPage("analyze");
  $("#themeButton").onclick = () => document.body.classList.toggle("dark");
  $("#languageButton").onclick = () => { lang = lang === "en" ? "hi" : "en"; i18n(); renderGuide(); renderTips(); };
  $("#searchInput").oninput = renderGuide;

  $$(".filter").forEach(b => b.onclick = () => {
    crop = b.dataset.crop;
    $$(".filter").forEach(f => f.classList.toggle("active", f === b));
    renderGuide();
  });

  const input = $("#imageInput"), preview = $("#preview");
  input.onchange = () => {
    img = input.files[0] || null;
    if (img && !img.type.startsWith("image/")) { alert(t().invalid); img = null; input.value = ""; }
    if (preview.dataset.url) URL.revokeObjectURL(preview.dataset.url);
    preview.classList.toggle("hidden", !img);
    if (img) {
      preview.src = preview.dataset.url = URL.createObjectURL(img);
      $("#resultPanel").classList.add("hidden");
    }
    setMsg();
  };

  $("#analyzeButton").onclick = async () => {
    const x = t(), btn = $("#analyzeButton");
    if (!img) return alert(x.noImageAlert);
    btn.disabled = true;
    btn.textContent = x.analyzing;

    try {
      const fd = new FormData();
      fd.append("image", img);                       // field name expected by the backend
      const res = await fetch(API_URL, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Backend returned status " + res.status);

      const data = await res.json();
      const label = data.label || data.disease || data.prediction || data.class_name;
      if (!label) throw new Error("The backend response did not include a disease label.");

      let conf = Number(data.confidence ?? data.confidence_score ?? 0);
      if (conf <= 1) conf *= 100;

      const L = norm(label);
      const match = diseases.find(d => L.includes(norm(d.crop)) && L.includes(norm(d.name))) ||
                    diseases.find(d => L.includes(norm(d.name)));

      $("#resultImage").src = preview.src;
      $("#resultDisease").textContent = label;
      $("#resultConfidence").textContent = x.conf + conf.toFixed(1) + "%";
      $("#resultAdvice").innerHTML = match
        ? `<h3>${x.general}</h3><p>${match.about}</p>${ul(match.treatment)}`
        : `<p>${x.guideAdvice}</p>`;
      $("#resultPanel").classList.remove("hidden");

      const history = $("#history");
      history.querySelector(".muted")?.remove();
      const li = document.createElement("li");
      li.textContent = new Date().toLocaleString() + " — " + label;
      history.prepend(li);
      countScans();
    } catch (e) {
      alert(x.error + "\n\n" + x.backendError + "\n\nDetails: " + e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = t().analyzeBtn;
    }
  };

  $("#clearHistory").onclick = () => {
    $("#history").innerHTML = '<li class="muted" data-i18n="noHistory"></li>';
    i18n();
    countScans();
  };

  /* ---------- Start ---------- */
  renderTips();
  i18n();
  renderGuide();
  countScans();
});
