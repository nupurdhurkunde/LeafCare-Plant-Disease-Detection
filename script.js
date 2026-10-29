
document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  let currentLanguage = "en";
  let currentCrop = "All";
  let selectedImage = null;
  let scans = 0;

  const translations = {
    en: {
      brandSubtitle: "Plant Health & Treatment Advisory",
      dashboard: "▦ Dashboard",
      analyze: "📷 Analyze Plant",
      guide: "📖 Disease & Treatment Guide",
      tips: "🌱 Tips & Prevention",
      sidebarTitle: "🌱 Plant health matters",
      sidebarText: "Upload a clear leaf photograph to check for a possible disease and explore care recommendations.",
      model: "Model: MobileNetV2 (planned integration)",
      breadcrumbDashboard: "Dashboard",
      breadcrumbAnalyze: "Analyze Plant",
      breadcrumbGuide: "Disease & Treatment Guide",
      breadcrumbTips: "Tips & Prevention",
      theme: "🌙 Theme",
      welcome: "WELCOME TO LEAFCARE 🌱",
      heading: "Let's keep your plants healthy.",
      intro: "Explore plant diseases, upload leaf photographs, and learn about possible treatments.",
      check: "Check your plant",
      choose: "Choose a leaf photograph to begin.",
      start: "＋ Analyze a Plant",
      supportedDiseases: "Supported disease classes",
      supportedCrops: "Supported crops",
      analyses: "Analyses attempted",
      how: "How LeafCare works",
      step1: "Upload a clear photograph of a plant leaf.",
      step2: "The connected AI model predicts a possible condition.",
      step3: "Review the confidence score and advisory information.",
      step4: "Follow appropriate prevention and care practices.",
      backendInfo: "The image prediction feature requires a running backend model. The guide and other frontend features can be explored without it.",
      recent: "Recent activity",
      noHistory: "No analyses yet.",
      clearHistory: "Clear history",
      analyzeHeading: "Analyze Plant",
      analyzeIntro: "Upload a leaf photograph for analysis by your connected model.",
      upload: "🍃 Upload a leaf image",
      uploadHelp: "Use a clear photograph with one leaf in focus.",
      noImage: "No image selected.",
      analyzeButton: "Analyze leaf",
      result: "Analysis result",
      notice: "The Analyze button connects to http://127.0.0.1:8000/predict. You must run your own compatible FastAPI model backend for real predictions.",
      guideHeading: "Disease & Treatment Guide",
      guideIntro: "Explore the supported potato and tomato conditions, their symptoms, treatment options, and prevention.",
      search: "Search by disease, crop, or symptom...",
      allCrops: "All crops",
      potato: "🥔 Potato",
      tomato: "🍅 Tomato",
      treatmentHeading: "Treatment & Prevention Details",
      guideNotice: "These are general educational recommendations, not a confirmed diagnosis. Before using pesticides or fungicides, verify the product, dosage, and safety precautions with a qualified local agriculture professional.",
      tipsHeading: "Tips & Prevention",
      tipsIntro: "Good practices can help reduce the risk of many plant diseases.",
      footer: "LeafCare — Plant Disease Detection & Treatment Advisory System",
      languageButton: "हिंदी",
      selected: "Selected: ",
      noImageAlert: "Please choose a leaf image first.",
      invalidImage: "Please select an image file.",
      analyzing: "Analyzing...",
      analyzingError: "Could not analyze the image.",
      backendError: "Make sure your LeafCare backend is running at http://127.0.0.1:8000 and supports POST /predict.",
      modelConfidence: "Model confidence: ",
      viewGuidance: "View guidance",
      noMatches: "No matching conditions found. Try another search.",
      about: "About:",
      symptoms: "Common symptoms:",
      treatment: "Treatment / care:",
      prevention: "Prevention:",
      generalGuidance: "General guidance",
      guideAdvice: "Review the Disease & Treatment Guide for general information. This prediction needs careful interpretation.",
      healthy: "Healthy",
      earlyBlight: "Early Blight",
      lateBlight: "Late Blight",
      leafMold: "Leaf Mold",
      mosaicVirus: "Mosaic Virus",
      targetSpot: "Target Spot",
      healthyAdvice: "A healthy-looking leaf does not guarantee the entire plant is disease-free. Continue routine monitoring."
    },

    hi: {
      brandSubtitle: "पौधों के स्वास्थ्य और उपचार संबंधी सलाह",
      dashboard: "▦ डैशबोर्ड",
      analyze: "📷 पौधे की जाँच",
      guide: "📖 रोग एवं उपचार गाइड",
      tips: "🌱 सुझाव एवं बचाव",
      sidebarTitle: "🌱 पौधों का स्वास्थ्य महत्वपूर्ण है",
      sidebarText: "संभावित रोग की जाँच और देखभाल के सुझाव पाने के लिए पत्ती की साफ तस्वीर अपलोड करें।",
      model: "मॉडल: MobileNetV2 (एकीकरण की योजना)",
      breadcrumbDashboard: "डैशबोर्ड",
      breadcrumbAnalyze: "पौधे की जाँच",
      breadcrumbGuide: "रोग एवं उपचार गाइड",
      breadcrumbTips: "सुझाव एवं बचाव",
      theme: "🌙 थीम",
      welcome: "लीफकेयर में आपका स्वागत है 🌱",
      heading: "आइए, अपने पौधों को स्वस्थ रखें।",
      intro: "पौधों के रोगों की जानकारी लें, पत्तियों की तस्वीर अपलोड करें और संभावित उपचार जानें।",
      check: "अपने पौधे की जाँच करें",
      choose: "शुरू करने के लिए पत्ती की तस्वीर चुनें।",
      start: "＋ पौधे की जाँच करें",
      supportedDiseases: "समर्थित रोग श्रेणियाँ",
      supportedCrops: "समर्थित फसलें",
      analyses: "किए गए विश्लेषण",
      how: "लीफकेयर कैसे काम करता है",
      step1: "पौधे की पत्ती की साफ तस्वीर अपलोड करें।",
      step2: "जुड़ा हुआ AI मॉडल संभावित स्थिति की पहचान करता है।",
      step3: "विश्वास स्कोर और सलाह संबंधी जानकारी देखें।",
      step4: "उचित बचाव और देखभाल के उपाय अपनाएँ।",
      backendInfo: "तस्वीर से रोग पहचानने के लिए बैकएंड मॉडल चालू होना चाहिए। गाइड और अन्य वेबसाइट सुविधाएँ इसके बिना भी देखी जा सकती हैं।",
      recent: "हाल की गतिविधियाँ",
      noHistory: "अभी तक कोई विश्लेषण नहीं हुआ है।",
      clearHistory: "इतिहास साफ करें",
      analyzeHeading: "पौधे की जाँच",
      analyzeIntro: "अपने जुड़े हुए मॉडल से जाँच कराने के लिए पत्ती की तस्वीर अपलोड करें।",
      upload: "🍃 पत्ती की तस्वीर अपलोड करें",
      uploadHelp: "एक पत्ती की साफ और स्पष्ट तस्वीर चुनें।",
      noImage: "कोई तस्वीर नहीं चुनी गई है।",
      analyzeButton: "पत्ती की जाँच करें",
      result: "जाँच का परिणाम",
      notice: "जाँच का बटन आपके बैकएंड http://127.0.0.1:8000/predict से जुड़ता है। वास्तविक परिणामों के लिए FastAPI मॉडल बैकएंड चालू होना चाहिए।",
      guideHeading: "रोग एवं उपचार गाइड",
      guideIntro: "आलू और टमाटर की फसलों की स्थितियों, लक्षणों, उपचार और बचाव के बारे में जानें।",
      search: "रोग, फसल या लक्षण खोजें...",
      allCrops: "सभी फसलें",
      potato: "🥔 आलू",
      tomato: "🍅 टमाटर",
      treatmentHeading: "उपचार एवं बचाव की जानकारी",
      guideNotice: "यह सामान्य शैक्षिक जानकारी है, पक्की बीमारी की पहचान नहीं। कीटनाशक या फफूंदनाशक इस्तेमाल करने से पहले स्थानीय कृषि विशेषज्ञ से उत्पाद, मात्रा और सुरक्षा संबंधी निर्देशों की पुष्टि करें।",
      tipsHeading: "सुझाव एवं बचाव",
      tipsIntro: "अच्छी देखभाल से पौधों में कई रोगों का खतरा कम हो सकता है।",
      footer: "लीफकेयर — पौधों के रोगों की पहचान और देखभाल संबंधी सलाह",
      languageButton: "English",
      selected: "चुनी गई तस्वीर: ",
      noImageAlert: "कृपया पहले पत्ती की तस्वीर चुनें।",
      invalidImage: "कृपया तस्वीर वाली फ़ाइल चुनें।",
      analyzing: "तस्वीर की जाँच हो रही है...",
      analyzingError: "तस्वीर की जाँच नहीं हो सकी।",
      backendError: "जाँचें कि LeafCare बैकएंड http://127.0.0.1:8000 पर चल रहा है और POST /predict का समर्थन करता है।",
      modelConfidence: "मॉडल का विश्वास स्कोर: ",
      viewGuidance: "सलाह देखें",
      noMatches: "इस खोज से मेल खाती स्थिति नहीं मिली। दूसरी खोज आज़माएँ।",
      about: "जानकारी:",
      symptoms: "सामान्य लक्षण:",
      treatment: "उपचार / देखभाल:",
      prevention: "बचाव:",
      generalGuidance: "सामान्य सलाह",
      guideAdvice: "सामान्य जानकारी के लिए रोग एवं उपचार गाइड देखें। इस अनुमान का सावधानीपूर्वक मूल्यांकन करें।",
      healthy: "स्वस्थ",
      earlyBlight: "अर्ली ब्लाइट (प्रारंभिक झुलसा)",
      lateBlight: "लेट ब्लाइट (पछेती झुलसा)",
      leafMold: "पत्ती फफूंद रोग",
      mosaicVirus: "मोज़ेक वायरस",
      targetSpot: "टारगेट स्पॉट (लक्ष्याकार धब्बे)",
      healthyAdvice: "पत्ती स्वस्थ दिखने का अर्थ यह नहीं है कि पूरा पौधा रोगमुक्त है। नियमित जाँच करते रहें।"
    }
  };

  const diseases = [
    {
      crop:"Potato", name:"Early Blight", emoji:"🥔",
      symptoms:"Brown spots, often with concentric rings, on older leaves. Yellowing may appear around the spots.",
      about:"Early blight is a fungal disease associated with Alternaria species. Symptoms and severity can vary with weather and crop conditions.",
      treatment:["Remove badly affected leaves where practical and dispose of infected plant material appropriately.","Avoid wetting foliage when watering.","If the disease continues to spread, ask a local agriculture professional about an approved fungicide and its label instructions."],
      prevention:["Rotate crops where possible.","Maintain suitable spacing and airflow.","Avoid leaving infected plant debris around the crop."]
    },
    {
      crop:"Potato", name:"Late Blight", emoji:"🥔",
      symptoms:"Water-soaked-looking dark patches that can enlarge quickly, sometimes with pale growth near lesion edges in humid conditions.",
      about:"Late blight is a serious disease caused by Phytophthora infestans. It can spread rapidly in cool, wet conditions.",
      treatment:["Remove and dispose of affected plants according to local agricultural guidance.","Avoid moving infected plant material through the field.","Contact an agriculture officer promptly for locally approved disease-management advice."],
      prevention:["Inspect crops regularly, especially during wet weather.","Use healthy planting material and suitable resistant varieties where available.","Follow local disease alerts and recommended crop-protection guidance."]
    },
    {
      crop:"Potato", name:"Healthy", emoji:"🥔",
      symptoms:"Leaves generally have an even green colour and no obvious expanding lesions or unusual patterns.",
      about:"A healthy-looking leaf does not guarantee the entire plant is disease-free. Continue routine monitoring.",
      treatment:["No disease treatment is indicated by appearance alone.","Continue normal crop care and investigate any new symptoms."],
      prevention:["Provide appropriate sunlight and watering.","Maintain good soil drainage and nutrition.","Inspect both sides of leaves regularly."]
    },
    {
      crop:"Tomato", name:"Healthy", emoji:"🍅",
      symptoms:"Leaves generally show normal colour and growth without obvious disease lesions or abnormal patterns.",
      about:"Healthy-looking leaves are a positive sign, but regular plant monitoring is still important.",
      treatment:["No disease treatment is indicated by appearance alone.","Continue routine care and watch for changes."],
      prevention:["Water near the soil instead of repeatedly wetting leaves.","Provide suitable spacing and sunlight.","Check plants regularly for pests and symptoms."]
    },
    {
      crop:"Tomato", name:"Leaf Mold", emoji:"🍅",
      symptoms:"Yellowish patches on the upper leaf surface may occur with olive-green or brownish growth underneath in humid conditions.",
      about:"Tomato leaf mold is associated with the fungus Passalora fulva and is favoured by high humidity.",
      treatment:["Remove heavily affected leaves when practical.","Improve ventilation and avoid prolonged leaf wetness.","Ask a local agriculture professional about approved control products if the disease persists."],
      prevention:["Increase airflow between plants.","Use watering practices that keep foliage as dry as practical.","Manage greenhouse or growing-area humidity where possible."]
    },
    {
      crop:"Tomato", name:"Mosaic Virus", emoji:"🍅",
      symptoms:"Mottled light and dark green leaf patterns, distortion, or unusual leaf growth may occur.",
      about:"Mosaic-like symptoms can be associated with plant viruses, but visual symptoms alone cannot confirm which virus is present.",
      treatment:["There is generally no curative treatment for a plant once a viral infection is established.","Isolate suspicious plants where practical and seek local agricultural guidance.","Clean tools and handle plants carefully to reduce mechanical spread."],
      prevention:["Use healthy seeds and planting material.","Control relevant insect vectors when advised by local experts.","Clean tools and wash hands after handling suspicious plants."]
    },
    {
      crop:"Tomato", name:"Target Spot", emoji:"🍅",
      symptoms:"Circular brown leaf lesions may develop concentric rings, sometimes giving a target-like appearance.",
      about:"Target spot is associated with the fungus Corynespora cassiicola. Other conditions can produce similar spots.",
      treatment:["Remove severely affected foliage where practical.","Avoid overhead watering and improve airflow.","Seek local advice about approved fungicides if the disease is spreading."],
      prevention:["Inspect leaves regularly.","Avoid excessive foliage wetness.","Maintain suitable plant spacing and remove crop debris."]
    }
  ];

  const tips = [
    ["💧","Water carefully","Water near the soil and avoid repeatedly wetting leaves, especially late in the day."],
    ["☀️","Provide suitable sunlight","Follow the light requirements of your crop and avoid overcrowding plants."],
    ["🔎","Inspect leaves regularly","Look at both sides of leaves and check for new spots, discolouration, or unusual growth."],
    ["🌬️","Improve airflow","Suitable spacing can help foliage dry faster and reduce conditions favourable to some diseases."],
    ["🧹","Keep the growing area clean","Remove diseased plant debris appropriately and clean tools between plants."],
    ["🌱","Use healthy planting material","Choose healthy seeds or seedlings and use locally suitable varieties where available."]
  ];

  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  function showPage(pageId) {
    $$(".page").forEach(page => page.classList.remove("active"));
    $$("nav button").forEach(button => {
      button.classList.toggle("active", button.dataset.page === pageId);
    });

    const page = document.getElementById(pageId);
    const navButton = document.querySelector(
      'nav button[data-page="' + pageId + '"]'
    );

    if (page) page.classList.add("active");
    if (navButton) $("#breadcrumb").textContent = navButton.textContent.trim();

    $(".content").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cropName(crop) {
    if (currentLanguage === "hi") {
      if (crop === "Potato") return "आलू";
      if (crop === "Tomato") return "टमाटर";
      if (crop === "All") return "सभी फसलें";
    }
    return crop;
  }

  function diseaseName(name) {
    if (currentLanguage !== "hi") return name;

    const t = translations.hi;
    const names = {
      "Early Blight": t.earlyBlight,
      "Late Blight": t.lateBlight,
      "Healthy": t.healthy,
      "Leaf Mold": t.leafMold,
      "Mosaic Virus": t.mosaicVirus,
      "Target Spot": t.targetSpot
    };

    return names[name] || name;
  }

  function renderGuide() {
    const search = $("#searchInput").value.toLowerCase().trim();

    const filtered = diseases.filter(d => {
      const matchesCrop = currentCrop === "All" || d.crop === currentCrop;
      const text = [
        d.crop, d.name, d.symptoms, d.about,
        ...d.treatment, ...d.prevention
      ].join(" ").toLowerCase();

      return matchesCrop && text.includes(search);
    });

    const cards = $("#diseaseList");
    const treatment = $("#treatmentList");
    const t = translations[currentLanguage];

    cards.innerHTML = "";
    treatment.innerHTML = "";

    if (!filtered.length) {
      cards.innerHTML = "<p>" + t.noMatches + "</p>";
      return;
    }

    filtered.forEach((d, index) => {
      const card = document.createElement("article");
      card.className = "disease-card";

      const emoji = document.createElement("div");
      emoji.style.fontSize = "30px";
      emoji.textContent = d.emoji;

      const crop = document.createElement("p");
      crop.textContent = cropName(d.crop);

      const heading = document.createElement("h3");
      heading.textContent = diseaseName(d.name);

      const symptoms = document.createElement("p");
      symptoms.textContent = d.symptoms;

      const button = document.createElement("button");
      button.className = "primary";
      button.type = "button";
      button.textContent = t.viewGuidance;

      card.append(emoji, crop, heading, symptoms, button);

      const detail = document.createElement("details");
      detail.id = "details-" + index;

      const summary = document.createElement("summary");
      summary.textContent = cropName(d.crop) + " — " + diseaseName(d.name);
      detail.appendChild(summary);

      const about = document.createElement("p");
      const aboutLabel = document.createElement("strong");
      aboutLabel.textContent = t.about + " ";
      about.append(aboutLabel, document.createTextNode(d.about));
      detail.appendChild(about);

      const symptomParagraph = document.createElement("p");
      const symptomLabel = document.createElement("strong");
      symptomLabel.textContent = t.symptoms + " ";
      symptomParagraph.append(symptomLabel, document.createTextNode(d.symptoms));
      detail.appendChild(symptomParagraph);

      const treatmentTitle = document.createElement("p");
      const treatmentLabel = document.createElement("strong");
      treatmentLabel.textContent = t.treatment;
      treatmentTitle.appendChild(treatmentLabel);
      detail.appendChild(treatmentTitle);

      const treatmentUl = document.createElement("ul");
      d.treatment.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        treatmentUl.appendChild(li);
      });
      detail.appendChild(treatmentUl);

      const preventionTitle = document.createElement("p");
      const preventionLabel = document.createElement("strong");
      preventionLabel.textContent = t.prevention;
      preventionTitle.appendChild(preventionLabel);
      detail.appendChild(preventionTitle);

      const preventionUl = document.createElement("ul");
      d.prevention.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        preventionUl.appendChild(li);
      });
      detail.appendChild(preventionUl);

      button.addEventListener("click", () => {
        detail.open = true;
        detail.scrollIntoView({ behavior: "smooth", block: "center" });
      });

      cards.appendChild(card);
      treatment.appendChild(detail);
    });
  }

  function renderTips() {
    const list = $("#tipsList");
    list.innerHTML = "";

    tips.forEach(tip => {
      const card = document.createElement("article");
      card.className = "disease-card";

      const emoji = document.createElement("div");
      emoji.style.fontSize = "30px";
      emoji.textContent = tip[0];

      const heading = document.createElement("h3");
      heading.textContent = tip[1];

      const description = document.createElement("p");
      description.textContent = tip[2];

      card.append(emoji, heading, description);
      list.appendChild(card);
    });
  }

  function applyLanguage() {
    const t = translations[currentLanguage];
    document.documentElement.lang = currentLanguage;

    $("#languageButton").textContent = t.languageButton;

    $$("nav button").forEach(button => {
      const key = button.dataset.page;
      button.textContent = t[key] || button.textContent;
    });

    $(".brand small").textContent = t.brandSubtitle;
    $(".sidebar-note strong").textContent = t.sidebarTitle;

    const sidebarParagraphs = $$(".sidebar-note p");
    if (sidebarParagraphs[0]) sidebarParagraphs[0].textContent = t.sidebarText;
    if (sidebarParagraphs[1]) sidebarParagraphs[1].textContent = t.model;

    $("#themeButton").textContent = t.theme;

    const activePage = $(".page.active");
    if (activePage) {
      const breadcrumbKeys = {
        dashboard: "breadcrumbDashboard",
        analyze: "breadcrumbAnalyze",
        guide: "breadcrumbGuide",
        tips: "breadcrumbTips"
      };
      $("#breadcrumb").textContent = t[breadcrumbKeys[activePage.id]];
    }

    // Dashboard
    $("#dashboard > p.green").textContent = t.welcome;
    $("#dashboard h1").textContent = t.heading;

    const dashboardParagraphs = $$("#dashboard > p.muted");
    if (dashboardParagraphs[0]) dashboardParagraphs[0].textContent = t.intro;

    const panels = $$("#dashboard .panel");

    if (panels[0]) {
      panels[0].querySelector("h2").textContent = t.check;
      panels[0].querySelector("p").textContent = t.choose;
      $("#startAnalyze").textContent = t.start;
    }

    const stats = $$("#dashboard .stat");
    if (stats[0]) stats[0].lastChild.textContent = " " + t.supportedDiseases;
    if (stats[1]) stats[1].lastChild.textContent = " " + t.supportedCrops;
    if (stats[2]) stats[2].lastChild.textContent = " " + t.analyses;

    if (panels[1]) {
      panels[1].querySelector("h2").textContent = t.how;
      panels[1].querySelectorAll("ol li").forEach((item, index) => {
        item.textContent = [t.step1, t.step2, t.step3, t.step4][index];
      });
      panels[1].querySelector("p.muted").textContent = t.backendInfo;
    }

    if (panels[2]) {
      panels[2].querySelector("h2").textContent = t.recent;
      const empty = $("#history .muted");
      if (empty) empty.textContent = t.noHistory;
      $("#clearHistory").textContent = t.clearHistory;
    }

    // Analyze page
    $("#analyze h1").textContent = t.analyzeHeading;
    $("#analyze > p.muted").textContent = t.analyzeIntro;
    $("#analyze .upload h2").textContent = t.upload;
    $("#analyze .upload p").textContent = t.uploadHelp;
    $("#uploadMessage").textContent = selectedImage
      ? t.selected + selectedImage.name
      : t.noImage;
    $("#analyzeButton").textContent = t.analyzeButton;
    $("#resultPanel h2").textContent = t.result;
    $("#analyze .notice").textContent = t.notice;

    // Guide page
    $("#guide h1").textContent = t.guideHeading;
    $("#guide > p.muted").textContent = t.guideIntro;
    $("#searchInput").placeholder = t.search;

    const filters = $$("#guide .filter");
    if (filters[0]) filters[0].textContent = t.allCrops;
    if (filters[1]) filters[1].textContent = t.potato;
    if (filters[2]) filters[2].textContent = t.tomato;

    $("#guide h2").textContent = t.treatmentHeading;
    $("#guide .notice").textContent = t.guideNotice;

    // Tips and footer
    $("#tips h1").textContent = t.tipsHeading;
    $("#tips > p.muted").textContent = t.tipsIntro;
    $("footer").textContent = t.footer;

    renderGuide();
    renderTips();
  }

  // Navigation
  $$("nav button").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.page));
  });

  $("#startAnalyze").addEventListener("click", () => showPage("analyze"));

  // Theme toggle
  $("#themeButton").addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  // Hindi / English toggle
  $("#languageButton").addEventListener("click", () => {
    currentLanguage = currentLanguage === "en" ? "hi" : "en";
    applyLanguage();
  });

  // Search and crop filters
  $("#searchInput").addEventListener("input", renderGuide);

  $$(".filter").forEach(button => {
    button.addEventListener("click", () => {
      currentCrop = button.dataset.crop;
      $$(".filter").forEach(item => {
        item.classList.toggle("active", item === button);
      });
      renderGuide();
    });
  });

  // Image selection and preview
  const imageInput = $("#imageInput");
  const preview = $("#preview");

  imageInput.addEventListener("change", () => {
    selectedImage = imageInput.files[0] || null;

    if (!selectedImage) {
      preview.classList.add("hidden");
      $("#uploadMessage").textContent = translations[currentLanguage].noImage;
      return;
    }

    if (!selectedImage.type.startsWith("image/")) {
      alert(translations[currentLanguage].invalidImage);
      selectedImage = null;
      imageInput.value = "";
      preview.classList.add("hidden");
      $("#uploadMessage").textContent = translations[currentLanguage].noImage;
      return;
    }

    if (preview.dataset.objectUrl) {
      URL.revokeObjectURL(preview.dataset.objectUrl);
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    preview.dataset.objectUrl = objectUrl;
    preview.src = objectUrl;
    preview.classList.remove("hidden");

    $("#uploadMessage").textContent =
      translations[currentLanguage].selected + selectedImage.name;

    $("#resultPanel").classList.add("hidden");
  });

  // Image analysis
  $("#analyzeButton").addEventListener("click", async () => {
    const t = translations[currentLanguage];

    if (!selectedImage) {
      alert(t.noImageAlert);
      return;
    }

    const button = $("#analyzeButton");
    button.disabled = true;
    button.textContent = t.analyzing;

    try {
      const formData = new FormData();

      // Keep the original backend field name.
      formData.append("image", selectedImage);

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Backend returned status " + response.status);
      }

      const data = await response.json();
      const disease = data.label || data.disease ||
        data.prediction || data.class_name;

      if (!disease) {
        throw new Error("The backend response did not include a disease label.");
      }

      const confidence = Number(
        data.confidence ?? data.confidence_score ?? 0
      );
      const normalizedConfidence =
        confidence <= 1 ? confidence * 100 : confidence;

      $("#resultImage").src = preview.src;
      $("#resultDisease").textContent = disease;
      $("#resultConfidence").textContent =
        t.modelConfidence + normalizedConfidence.toFixed(1) + "%";

      const matching = diseases.find(d =>
        disease.toLowerCase().includes(d.name.toLowerCase()) ||
        d.name.toLowerCase().includes(disease.toLowerCase())
      );

      const advice = $("#resultAdvice");
      advice.innerHTML = "";

      const adviceHeading = document.createElement("h3");
      adviceHeading.textContent = matching
        ? t.generalGuidance
        : t.guideAdvice;
      advice.appendChild(adviceHeading);

      if (matching) {
        const about = document.createElement("p");
        about.textContent = matching.about;
        advice.appendChild(about);

        const list = document.createElement("ul");
        matching.treatment.forEach(item => {
          const li = document.createElement("li");
          li.textContent = item;
          list.appendChild(li);
        });
        advice.appendChild(list);
      } else {
        const message = document.createElement("p");
        message.textContent = t.guideAdvice;
        advice.appendChild(message);
      }

      $("#resultPanel").classList.remove("hidden");

      scans++;
      $("#scanCount").textContent = scans;

      const history = $("#history");
      const empty = history.querySelector(".muted");
      if (empty) history.innerHTML = "";

      const item = document.createElement("li");
      item.textContent = new Date().toLocaleString() + " — " + disease;
      history.prepend(item);

    } catch (error) {
      alert(
        t.analyzingError + "\n\n" +
        t.backendError + "\n\nDetails: " + error.message
      );
    } finally {
      button.disabled = false;
      button.textContent = translations[currentLanguage].analyzeButton;
    }
  });

  // Clear history
  $("#clearHistory").addEventListener("click", () => {
    $("#history").innerHTML =
      '<li class="muted">' + translations[currentLanguage].noHistory + "</li>";
    scans = 0;
    $("#scanCount").textContent = "0";
  });

  // Initial rendering
  renderGuide();
  renderTips();
  applyLanguage();
});
