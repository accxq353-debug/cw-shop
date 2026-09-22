"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "lt" | "en";

export const dictionary = {
  lt: {
    // Nav
    home: "Pradžia",
    games: "Žaidimai",
    subs: "Prenumeratos",
    catalog: "Kainoraštis",
    reviews: "Atsiliepimai",
    faq: "DUK",
    account: "Paskyra",
    cart: "Krepšelis",
    discordServer: "Discord serveris",
    clickHere: "Spausk čia",
    searchPlaceholder: "Ieškok: Netflix, Robux, SMM, VPN…",
    searchTitle: "Ieškoti produktų",

    // Banner
    announcement: "Šiuo metu yra begalė užsakymų — atsiprašome, jei jūsų užsakymas vėluoja. Daugiau informacijos Discord serveryje.",

    // Hero
    estBadge: "Įkurta 2026 · rankinis patvirtinimas · garantija",
    heroTitle1: "Mažesnės kainos.",
    heroTitle2: "Daugiau pramogų.",
    heroDesc: "Nuo 2026 metų padedame sutaupyti perkant žaidimus, prenumeratas ir skaitmenines prekes. Kainoraštis be paslėptų mokesčių — ką matai, tą ir moki. Greitas pristatymas ir patikimas aptarnavimas vienoje vietoje.",
    viewProducts: "Peržiūrėti produktus",
    statProducts: "Prekių",
    statVariants: "Variantų",
    statDelivery: "Pristatymas",
    statPayment: "Atsiskaitymas",
    statDeliveryVal: "1–30 min.",
    statPaymentVal: "PayPal · Bankas · LTC",

    // Pipeline
    pipelineTitle: "Apsaugos & Pristatymo Sistema",
    pipelineSubtitle: "4 žingsnių saugus pirkimo procesas",
    pipe1Title: "Prisijunk per Discord",
    pipe1Desc: "Tapatybės susiejimas arba greitas el. paštas",
    pipe2Title: "Saugus apmokėjimas",
    pipe2Desc: "PayPal F&F, Banko pavedimas (LT) arba LTC",
    pipe3Title: "Proof patvirtinimas",
    pipe3Desc: "Ekrano nuotrauka tiesiai į darbuotojų kanalą",
    pipe4Title: "Automatinis Ticket gavimas",
    pipe4Desc: "Prekės pristatymas svetainėje ir sąskaita el. paštu",

    // Vouches
    vouchBadge: "Realaus laiko srautas",
    vouchTitle: "Discord #vouched kanalo atsiliepimai",
    vouchDesc: "Realių narių patvirtinti atsiliepimai tiesiai iš mūsų oficialios bendruomenės.",
    vouchBtn: "Peržiūrėti visus #vouched Discord'e",
    verifiedBuyer: "Patvirtintas pirkėjas",

    // Catalog & Homepage Sections
    bestsellersTitle: "Perkamiausi",
    bestsellersHeading: "Ką perka šią savaitę",
    allCatalogLink: "Visas kainoraštis",
    allProductsBtn: "Visi produktai",
    catalogHeading: "Prekių katalogas",
    catalogSubheading: "Rinkis iš dešimčių prekių ir variantų",
    categoriesLabel: "Kategorijos",
    allCategories: "Visos prekės",
    totalInCatalog: "Iš viso",
    variantsInCatalog: "variantų kainoraštyje",
    cheapestTitle: "Kainoraštis",
    cheapestHeading: "Pigiausia nuo",
    cheapestSub: "Kiekvienos prekės įėjimo kaina. Visi variantai — produkto puslapyje.",
    unitsLabel: "Vienetai",
    chooseBtn: "Rinktis",
    whyUsHeading: "Kuo mes skiriamės",
    whyUsSub: "Ką gauni pirkdamas pas mus",
    benefits: [
      {
        n: "01",
        title: "Pristatymas per minutes",
        body: "Didžioji dalis prekių keliauja 1–10 min. nuo apmokėjimo patvirtinimo tiesiai svetainėje ir el. paštu.",
      },
      {
        n: "02",
        title: "Garantija visam laikotarpiui",
        body: "Prenumerata nustojo veikti anksčiau laiko? Pakeičiame nauja arba grąžiname pinigus. Jokių klausimų.",
      },
      {
        n: "03",
        title: "Tavo paskyra lieka tavo",
        body: "Canva, Spotify, Adobe Express ir Gemini aktyvuojame tavo pačio paskyroje. Slaptažodžių neprašome.",
      },
      {
        n: "04",
        title: "Gyvas žmogus Discord'e",
        body: "Nauja parduotuvė, bet už jos — gyvi žmonės. Klausimai sprendžiami tiesiogiai Discord'e, ne per robotą.",
      },
    ],
    reviewsHeading: "Ką sako pirkėjai",
    allReviewsLink: "Visi atsiliepimai",
    faqHeading: "Dažniausiai klausiama",
    allFaqLink: "Visi klausimai",
    ctaHeading: "Neradai ko ieškai?",
    ctaSub: "Parašyk Discord serveryje — turime tiektėjus ir didesniems SMM kiekiams, ir retesnėms paskyroms. Atsakome greitai.",
    backToCatalog: "← Grįžti į kainoraštį",

    // Product cards & Page
    from: "Nuo",
    view: "Žiūrėti",
    items: "prekės",
    deliveryLabel: "Pristatymas",
    typeLabel: "Tipas",
    warrantyLabel: "Garantija",
    fullPeriod: "Visas laikotarpis",
    chooseVariant: "Pasirink variantą",
    quantity: "Kiekis",
    totalAmount: "Suma",
    addToCart: "Į krepšelį",
    addedToCart: "Įdėta į krepšelį",
    inCartPrefix: "Krepšelyje:",
    proceedToCheckout: "Pereiti prie apmokėjimo →",
    allowedMethodsForProduct: "Galimi atsiskaitymo būdai šiai prekei:",
    relatedProducts: "Taip pat perka",

    // Cart
    cartTitle: "Krepšelis",
    cartEmptyTitle: "Krepšelis kol kas tuščias",
    cartEmptyDesc: "Įsidėk prekę iš kainoraščio — čia ji atsiras kartu su kiekiu, suma ir galimybe pereiti prie apmokėjimo.",
    openCatalogBtn: "Atidaryti kainoraštį",
    summaryTitle: "Suvestinė",
    yourOrderTitle: "Jūsų užsakymas",
    subtotal: "Tarpinė suma",
    totalToPay: "Bendra suma",
    continueCheckout: "Tęsti atsiskaitymą",
    safePaymentNote: "Saugus atsiskaitymas — užsakymo duomenys lieka pas mus",
    fastDeliveryNote: "Greitas pristatymas — prekę išsiunčiame patvirtinę mokėjimą",
    privacyNote: "Tavo duomenys privatūs — piniginių rekvizitų nesaugome",

    // Checkout
    checkoutTitle: "Atsiskaitymas",
    step1: "Duomenys",
    step2: "Apmokėjimas",
    step3: "Pristatymas",
    whereToSendHeading: "Kur atsiųsti prekę ir sąskaitą?",
    whereToSendDesc: "Užsakymo patvirtinimą, prekę ir PDF sąskaitą-faktūrą siunčiame el. paštu bei pateikiame jūsų paskyroje.",
    emailLabel: "El. paštas *",
    discordNameLabel: "Discord vardas (nebūtina)",
    orderNoteLabel: "Pastaba prie užsakymo",
    paymentMethodLegend: "Mokėjimo būdas *",
    singleMethodBadge: "Šiam produktui taikomas tik vienas būdas",
    continuePaymentBtn: "Tęsti į apmokėjimą",
    orderNumLabel: "Užsakymo numeris",
    cryptoAutoDetect: "Kriptovaliutų skaičiuoklė (Realaus laiko kursas)",
    exactAmount: "Tiksli suma",
    copied: "Nukopijuota!",
    copyHelper: "Kopijuoti",
    noRefundBadge: "Be grąžinimo.",
    noRefundWarning: "Jeigu siunčiant nurodei neteisingą informaciją — pinigai negrąžinami.",
    uploadProofTitle: "Mokėjimo įrodymas *",
    uploadProofPrompt: "Pasirink ekrano nuotrauką (PNG, JPG, WEBP, PDF · maks. 8 MB)",
    addProofBtn: "Pridėti įrodymą",
    proofAdded: "Pridėta",
    proofRequired: "Privaloma",
    waitingPaymentBadge: "Laukiama apmokėjimo",
    paymentSubmittedBadge: "Mokėjimas pateiktas",
    adminVerifyingNote: "Administratorius patvirtins mokėjimą rankiniu būdu",
    uploadProofBottomNote: "Įkelk įrodymą ir patvirtink apačioje",
    confirmSentBtn: "Pinigai išsiųsti",
    firstAttachProofAlert: "Pirmiausia pridėk įrodymą",
    changeMethodBtn: "Keisti mokėjimo būdą",
    proofReceivedTitle: "Įrodymas gautas",
    thanksVerifyingTitle: "Ačiū! Tikriname mokėjimą",
    orderPlacedDesc: "Užsakymas ir tavo įrodymas jau pas mus. Mokėjimą patvirtiname rankiniu būdu — atsiųsime prekę ir PDF sąskaitą į el. paštą bei pateiksime tiesiai svetainėje.",
    orderPlacedTimer: "Patvirtinimas dažniausiai užtrunka iki 30 minučių. Jei per tiek laiko negausi prekės — parašyk Discord ir nurodyk užsakymo numerį.",
    myOrdersBtn: "Mano užsakymai",

    // Account & Auth
    accountHeading: "Mano paskyra",
    signInToSeeOrders: "Prisijunk ir matyk visus savo užsakymus",
    signInDesc: "Paskyroje saugoma visa pirkimų istorija, užsakymų numeriai, būsenos ir administratoriaus pastabos — nereikia nieko ieškoti el. pašte.",
    authBenefit1: "Visi užsakymai ir sąskaitų (INV) numeriai vienoje vietoje",
    authBenefit2: "Realaus laiko būsena: laukiama · patvirtinta · išsiųsta",
    authBenefit3: "Mokėjimą patvirtiname rankiniu būdu — be klaidų ir be sukčiavimo",
    signInTab: "Prisijungti",
    signUpTab: "Registruotis",
    nameLabel: "Vardas",
    passwordLabel: "Slaptažodis",
    submitSignIn: "Prisijungti",
    submitSignUp: "Sukurti paskyrą",
    logOutBtn: "Atsijungti",
    memberSince: "narys nuo",
    adminDashboardBtn: "Administravimas",

    // My Orders
    noOrdersTitle: "Užsakymų kol kas nėra",
    noOrdersDescUser: "Kai atliksi pirmą pirkinį, jis atsiras čia kartu su būsena ir informacija.",
    noOrdersDescGuest: "Prisijunk prie paskyros — joje saugoma visa tavo užsakymų istorija, net jei užsakyta iš kito įrenginio.",
    browseCatalogBtn: "Peržiūrėti kainoraštį",
    orderDate: "Data",
    orderTotal: "Suma",
    paymentMethodLabel: "Mokėjimo būdas",
    proofLabel: "Įrodymas:",
    proofMissing: "Įrodymas nepridėtas",
    deliveredBoxHeading: "Jūsų užsakyta prekė / duomenys:",
    credentialsLabel: "Raktas / Paskyros duomenys:",
    alreadyReviewed: "Jūs jau palikote atsiliepimą šiam užsakymui.",
    pleaseLeaveReviewPrompt: "Prašome palikti atsiliepimą svetainėje! (Jei nepaliksite per 24 val., sistema sugeneruos automatiškai)",

    // Reviews & Form
    leaveReview: "Palikti atsiliepimą",
    rating: "Įvertinimas",
    comment: "Komentaras",
    sendReview: "Paskelbti atsiliepimą",
    attachProof: "Prisegti veikiančios prekės nuotrauką (Proof)",
    withPhotoProof: "Su foto įrodymu",
    viewProofImg: "🔍 Peržiūrėti įrodymą",
    reviewsPageHeading: "Atsiliepimai",
    reviewsPageSub: "Tikri žmonės, tikri užsakymai. Atsiliepimus palieka pirkėjai po pristatymo — be redagavimo ir be filtrų. Jei kažkas nepavyko, parašyk Discord ir ištaisysime.",

    // FAQ Page
    faqPageSub: "Atsakymai į klausimus, kuriuos gauname beveik kasdien. Neradai savo atsakymo? Discord atsakome greičiau nei el. paštu.",
    haveQuestions: "Liko klausimų?",
    haveQuestionsSub: "Parašyk Discord serveryje — atsakome greitai ir be automatinių atsakymų.",

    // Footer
    footerDesc: "Skaitmeninės prekės nuo 2026 metų: prenumeratos, žaidimai, SMM ir VPN. Greitas pristatymas į el. paštą arba Discord.",
    footerInfo: "Informacija",
    footerCopy: "Skaitmeninės prekės. Nesusiję su trečiųjų šalių prekės ženklais.",
    footerPaymentDisclaimer: "PayPal F&F · Banko pavedimas · Litecoin · be PVM",
  },
  en: {
    // Nav
    home: "Home",
    games: "Games",
    subs: "Subscriptions",
    catalog: "Price List",
    reviews: "Reviews",
    faq: "FAQ",
    account: "Account",
    cart: "Cart",
    discordServer: "Discord Server",
    clickHere: "Click here",
    searchPlaceholder: "Search: Netflix, Robux, SMM, VPN…",
    searchTitle: "Search products",

    // Banner
    announcement: "High order volume currently — apologies if your order experiences a brief delay. Updates in Discord.",

    // Hero
    estBadge: "Est. 2026 · Manual Verification · Full Warranty",
    heroTitle1: "Lower Prices.",
    heroTitle2: "More Entertainment.",
    heroDesc: "Since 2026, we help you save on gaming keys, continuous subscriptions, and digital services. Transparent pricing with no hidden fees — what you see is what you pay. Fast delivery and reliable support in one place.",
    viewProducts: "Browse Products",
    statProducts: "Products",
    statVariants: "Variants",
    statDelivery: "Delivery",
    statPayment: "Payment",
    statDeliveryVal: "1–30 min.",
    statPaymentVal: "PayPal · Bank · LTC",

    // Pipeline
    pipelineTitle: "Security & Delivery Pipeline",
    pipelineSubtitle: "4-step verified purchase process",
    pipe1Title: "Connect via Discord",
    pipe1Desc: "Identity verification or simple email checkout",
    pipe2Title: "Secure Payment",
    pipe2Desc: "PayPal F&F, EU Bank Transfer (IBAN), or LTC",
    pipe3Title: "Proof Verification",
    pipe3Desc: "Screenshot sent directly to staff audit channel",
    pipe4Title: "Automated Ticket / Product",
    pipe4Desc: "Direct in-site credentials & itemized invoice via email",

    // Vouches
    vouchBadge: "Real-Time Feed",
    vouchTitle: "Discord #vouched Channel Feed",
    vouchDesc: "Verified live transaction feedback pulled from our official Discord server.",
    vouchBtn: "View all #vouched on Discord",
    verifiedBuyer: "Verified Buyer",

    // Catalog & Homepage Sections
    bestsellersTitle: "Bestsellers",
    bestsellersHeading: "Top Picks This Week",
    allCatalogLink: "Full Price List",
    allProductsBtn: "All Products",
    catalogHeading: "Product Catalog",
    catalogSubheading: "Choose from dozens of subscriptions, keys, and services",
    categoriesLabel: "Categories",
    allCategories: "All Products",
    totalInCatalog: "Total",
    variantsInCatalog: "variants in catalog",
    cheapestTitle: "Price List",
    cheapestHeading: "Starting From",
    cheapestSub: "Entry price for each product. All tiers & options on the product page.",
    unitsLabel: "Units",
    chooseBtn: "Select",
    whyUsHeading: "Why Choose Us",
    whyUsSub: "What you get with every order",
    benefits: [
      {
        n: "01",
        title: "Delivery within Minutes",
        body: "Most orders are fulfilled within 1–10 minutes upon manual payment verification, directly in-site and via email.",
      },
      {
        n: "02",
        title: "Full Warranty Period",
        body: "If any subscription stops working during your period, we replace it or issue a prompt refund. No questions asked.",
      },
      {
        n: "03",
        title: "Your Account Stays Yours",
        body: "Canva, Spotify, Adobe Express, and Gemini activate directly on your own personal account. We never ask for passwords.",
      },
      {
        n: "04",
        title: "Real Staff on Discord",
        body: "A modern store backed by real humans. Questions and tickets are resolved directly on Discord, never by chatbots.",
      },
    ],
    reviewsHeading: "What Customers Say",
    allReviewsLink: "All Reviews",
    faqHeading: "Frequently Asked Questions",
    allFaqLink: "All Questions",
    ctaHeading: "Can't find what you need?",
    ctaSub: "Send us a message on Discord — our supplier network covers bulk SMM orders, rare accounts, and custom requests. Fast response guaranteed.",
    backToCatalog: "← Back to Price List",

    // Product cards & Page
    from: "From",
    view: "View",
    items: "items",
    deliveryLabel: "Delivery",
    typeLabel: "Type",
    warrantyLabel: "Warranty",
    fullPeriod: "Full period",
    chooseVariant: "Choose Variant",
    quantity: "Quantity",
    totalAmount: "Total",
    addToCart: "Add to Cart",
    addedToCart: "Added to Cart",
    inCartPrefix: "In Cart:",
    proceedToCheckout: "Proceed to Checkout →",
    allowedMethodsForProduct: "Available payment methods for this product:",
    relatedProducts: "Customers Also Bought",

    // Cart
    cartTitle: "Shopping Cart",
    cartEmptyTitle: "Your cart is currently empty",
    cartEmptyDesc: "Add an item from our catalog — it will show up here along with quantity, price, and instant checkout options.",
    openCatalogBtn: "Browse Catalog",
    summaryTitle: "Summary",
    yourOrderTitle: "Your Order",
    subtotal: "Subtotal",
    totalToPay: "Total to Pay",
    continueCheckout: "Continue to Checkout",
    safePaymentNote: "Secure checkout — your data remains private and protected",
    fastDeliveryNote: "Prompt delivery — orders are dispatched immediately upon verification",
    privacyNote: "Zero financial storage — we never keep your banking credentials",

    // Checkout
    checkoutTitle: "Checkout",
    step1: "Details",
    step2: "Payment",
    step3: "Delivery",
    whereToSendHeading: "Where should we deliver your product & invoice?",
    whereToSendDesc: "Order confirmations, product keys, and formal invoices are delivered to your email and accessible inside your account.",
    emailLabel: "Email Address *",
    discordNameLabel: "Discord Username (Optional)",
    orderNoteLabel: "Order Note",
    paymentMethodLegend: "Payment Method *",
    singleMethodBadge: "This product only accepts this specific payment method",
    continuePaymentBtn: "Proceed to Payment",
    orderNumLabel: "Order Number",
    cryptoAutoDetect: "Crypto Auto-Detector (Real-Time Rates)",
    exactAmount: "Exact Amount",
    copied: "Copied!",
    copyHelper: "Copy",
    noRefundBadge: "No Refund Policy.",
    noRefundWarning: "If you send to an incorrect address, wrong reference, or wrong payment type — transactions are strictly non-refundable.",
    uploadProofTitle: "Payment Proof *",
    uploadProofPrompt: "Select screenshot proof (PNG, JPG, WEBP, PDF · max 8 MB)",
    addProofBtn: "Attach Proof",
    proofAdded: "Attached",
    proofRequired: "Required",
    waitingPaymentBadge: "Awaiting Payment",
    paymentSubmittedBadge: "Payment Submitted",
    adminVerifyingNote: "Staff will manually audit and confirm your transaction",
    uploadProofBottomNote: "Attach your screenshot proof below to unlock confirmation",
    confirmSentBtn: "Payment Sent",
    firstAttachProofAlert: "Please attach payment proof first",
    changeMethodBtn: "Change Payment Method",
    proofReceivedTitle: "Proof Received",
    thanksVerifyingTitle: "Thank you! Auditing payment",
    orderPlacedDesc: "Your order and screenshot proof have been received. Staff will manually confirm your payment and deliver credentials and invoice to your email and account.",
    orderPlacedTimer: "Verification usually takes up to 30 minutes. If you experience delays, open a ticket on Discord with your order code.",
    myOrdersBtn: "My Orders",

    // Account & Auth
    accountHeading: "My Account",
    signInToSeeOrders: "Sign in to manage and view all your orders",
    signInDesc: "Your account stores complete order history, invoice codes, real-time statuses, and delivery credentials — no need to search old emails.",
    authBenefit1: "All orders and invoice (INV) codes in one dashboard",
    authBenefit2: "Live tracking: pending · confirmed · delivered",
    authBenefit3: "Manual staff verification — eliminating fraud and errors",
    signInTab: "Sign In",
    signUpTab: "Sign Up",
    nameLabel: "Name",
    passwordLabel: "Password",
    submitSignIn: "Sign In",
    submitSignUp: "Create Account",
    logOutBtn: "Sign Out",
    memberSince: "member since",
    adminDashboardBtn: "Admin Dashboard",

    // My Orders
    noOrdersTitle: "No orders placed yet",
    noOrdersDescUser: "When you place your first purchase, it will appear here with live fulfillment details.",
    noOrdersDescGuest: "Sign in to your account — all your past orders will sync seamlessly even across different devices.",
    browseCatalogBtn: "Browse Price List",
    orderDate: "Date",
    orderTotal: "Total",
    paymentMethodLabel: "Payment Method",
    proofLabel: "Proof:",
    proofMissing: "No proof attached",
    deliveredBoxHeading: "Your Delivered Product & Credentials:",
    credentialsLabel: "Key / Account Credentials:",
    alreadyReviewed: "You have already left a review for this order.",
    pleaseLeaveReviewPrompt: "Please take a moment to leave a review! (If unreviewed within 24h, a 5★ review will automatically generate)",

    // Reviews & Form
    leaveReview: "Leave a Review",
    rating: "Rating",
    comment: "Comment",
    sendReview: "Submit Review",
    attachProof: "Attach working product screenshot (Proof)",
    withPhotoProof: "With Photo Proof",
    viewProofImg: "🔍 View Proof Image",
    reviewsPageHeading: "Customer Reviews",
    reviewsPageSub: "Real people, real purchases. Feedback is submitted by verified customers post-delivery — unedited and authentic. If anything needs attention, reach out on Discord.",

    // FAQ Page
    faqPageSub: "Answers to questions our customers ask daily. Can't find yours? We respond faster on Discord than email.",
    haveQuestions: "Still have questions?",
    haveQuestionsSub: "Send us a message on Discord — real staff answers quickly without robotic autoresponders.",

    // Footer
    footerDesc: "Digital subscriptions, gaming keys, SMM and VPN services since 2026. Rapid delivery directly to your account and email.",
    footerInfo: "Information",
    footerCopy: "Digital products store. Not affiliated with third-party brands.",
    footerPaymentDisclaimer: "PayPal F&F · Bank Transfer · Litecoin · Zero VAT",
  },
};

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof dictionary["lt"];
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "lt",
  setLang: () => {},
  t: dictionary.lt,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("lt");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cw_lang") as Language;
      if (saved === "lt" || saved === "en") {
        setLangState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("cw_lang", newLang);
    } catch {
      // ignore
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: dictionary[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
