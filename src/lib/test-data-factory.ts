/**
 * Test Data Factory
 *
 * Generates realistic business case data for scenario testing.
 * Each generator returns data that fills all required fields with
 * plausible values for the given scenario type.
 * 
 * @module test-data-factory
 */

type TestDataGenerator = () => Record<string, string>;

// Utility functions for random data generation
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomCurrency = (min: number, max: number): string => 
  randomNumber(min, max).toString();
const randomPercentage = (min: number, max: number): string => 
  randomNumber(min, max).toString();

// Industry context templates for realistic business descriptions (100+ words each)
const industryContexts = {
  manufacturing: [
    "We are a mid-size automotive parts manufacturer headquartered in Southern Germany with approximately 450 employees across two production facilities. Our core business is supplying tier-1 OEMs (primarily BMW, Mercedes-Benz, and Volkswagen) with precision-machined aluminum and steel components for powertrain and chassis applications. We hold IATF 16949 certification and are currently pursuing carbon neutrality targets mandated by our major customers. Our competitive advantage lies in rapid prototyping capabilities and consistent zero-defect delivery performance. Key challenges include a skilled labor shortage in CNC machining, rising energy costs following recent geopolitical events, and pressure to transition capabilities toward electric vehicle components. We operate a just-in-time delivery model with 48-hour lead time requirements for most customers. Annual procurement spend is approximately €35M, with raw materials representing 60% of that figure.",
    "Industrial machinery manufacturer based in the Midwest United States, specializing in custom food processing equipment for the dairy and beverage industries. We employ 200 people including a strong in-house mechanical and electrical engineering team, though our digital and software capabilities remain limited. FDA compliance is mandatory for all equipment we produce, requiring extensive documentation and material traceability. Our typical sales cycle is 6-12 months with high customization requirements. We source heavily from both domestic and international suppliers, with lead times becoming increasingly unpredictable. Key procurement categories include stainless steel fabrications, motors and drives, control systems, and maintenance supplies. We are exploring automation solutions to address rising labor costs and capacity constraints. Our procurement function is relatively immature, with significant opportunity for category management and strategic sourcing improvements.",
    "Electronics contract manufacturer operating from a modern facility in Czech Republic, producing printed circuit board assemblies (PCBAs) primarily for medical device companies in Western Europe. We are ISO 13485 certified with a high-mix, low-volume production model that demands exceptional flexibility and traceability. Our customer base includes several Fortune 500 medical device manufacturers who require complete component genealogy and rigorous quality documentation. We process approximately 2,000 unique part numbers monthly with batch sizes ranging from 50 to 5,000 units. Key procurement challenges include semiconductor availability (though improving), conflict mineral compliance, and managing a complex approved vendor list with customer-mandated sources. We employ 180 staff including 25 in our supply chain and procurement department. Strategic priorities include reducing single-source dependencies and improving demand forecasting accuracy with our customers.",
  ],
  software: [
    "We are a B2B SaaS company providing human resources management solutions to mid-market and enterprise clients, primarily in North America and Western Europe. Our platform handles sensitive employee data including payroll, benefits, and performance management, requiring SOC2 Type 2 certification and GDPR compliance across all our operations and vendor relationships. Currently at 150 employees following our Series B funding round, we are scaling rapidly with aggressive hiring targets. Our technology stack is primarily AWS-based with a microservices architecture. Key procurement categories include cloud infrastructure, development tools, security solutions, and professional services for implementation support. We require all vendors handling employee data to meet our stringent security standards, including annual penetration testing and formal incident response procedures. Our procurement challenges include managing software sprawl, optimizing cloud spend, and ensuring vendor security compliance at scale.",
    "Fintech startup building payment infrastructure and checkout solutions for e-commerce platforms, primarily serving the European and LATAM markets. We are PCI-DSS Level 1 compliant and maintain SOC2 certification, processing over €500M in transactions annually. Our rapid growth phase (80% YoY user growth) creates significant procurement challenges around scaling infrastructure while maintaining security and compliance. Our architecture is AWS-native with heavy reliance on third-party APIs for payment processing, fraud detection, and identity verification. We employ 120 people across engineering, operations, and commercial teams. Key vendor relationships include payment schemes, banking partners, cloud providers, and specialized fintech service providers. Procurement priorities include negotiating volume-based pricing as we scale, ensuring business continuity through vendor diversification, and managing the complexity of multi-currency, multi-jurisdiction regulatory requirements. Our procurement function is maturing rapidly from startup-style ad-hoc purchasing.",
    "Enterprise software company serving the insurance industry with claims management and policy administration solutions. We are publicly traded with 500+ employees across offices in the US, UK, and India. Our customer base includes several top-20 global insurers who require extensive security due diligence and long-term vendor stability. We operate legacy mainframe systems that are being gradually migrated to cloud-based microservices, creating complex hybrid architecture challenges. Change management processes are rigorous given the regulated nature of our customers' businesses. Procurement categories include IT infrastructure, professional services (consulting and implementation), office facilities, and travel. Our procurement organization is centralized with category managers for key spend areas. Strategic initiatives include vendor consolidation, improving contract compliance, and implementing a new procure-to-pay system. Annual procurement spend exceeds $40M with significant opportunity for savings through strategic sourcing.",
  ],
  healthcare: [
    "We are a regional hospital network operating three acute care facilities and twelve outpatient clinics across the metropolitan area, employing approximately 2,000 clinical and administrative staff. HIPAA compliance is fundamental to all our operations, requiring rigorous vendor security assessments and business associate agreements for any technology or service provider accessing patient data. We are currently undertaking a major IT infrastructure modernization program, including EHR optimization, cybersecurity improvements, and telehealth expansion. Key procurement categories include medical devices and equipment, pharmaceuticals, IT systems, facilities maintenance, and clinical supplies. Our GPO (Group Purchasing Organization) relationship covers approximately 70% of our supply spend, but we maintain direct contracting relationships for high-value categories. Challenges include supply chain resilience following recent disruptions, managing physician preference items, and balancing cost reduction with quality of care requirements. Our procurement team of 15 professionals manages approximately $180M in annual spend.",
    "Pharmaceutical manufacturing company producing generic medications for the European and North American markets. We operate three FDA and EMA regulated manufacturing facilities with a combined workforce of 800 employees. Our product portfolio includes over 150 SKUs across solid oral dosage forms and injectables. Supply chain reliability is critical given the life-saving nature of our products and strict regulatory requirements around supply continuity. A strategic concern is our single-source dependency for several active pharmaceutical ingredients (APIs), particularly those sourced from Asian suppliers. Key procurement categories include APIs, excipients, packaging materials, equipment and maintenance, and contract manufacturing services. We are investing heavily in supply chain visibility and supplier quality management systems. Regulatory changes around serialization and environmental compliance are driving significant procurement and supplier development activity. Annual procurement spend exceeds €120M with raw materials representing the largest category.",
    "Medical device startup developing next-generation diagnostic equipment for point-of-care testing applications. We are a small team of 40 employees, predominantly engineers and scientists, with limited procurement expertise on staff. Currently pre-revenue and VC-backed, we are working toward ISO 13485 certification and FDA 510(k) clearance for our first product. Our supply chain is still being established, with key decisions pending around contract manufacturing versus in-house production. Procurement needs include prototype components, test equipment, contract design and manufacturing services, and regulatory consulting. We face challenges typical of startups: limited leverage with suppliers, cash flow constraints affecting payment terms, and building quality systems from scratch. Our immediate priorities are establishing a reliable supplier base for critical components and negotiating favorable terms with potential contract manufacturers. Budget constraints require creative approaches to procurement while maintaining quality standards required for medical devices.",
  ],
  retail: [
    "E-commerce fashion retailer with $50M annual revenue, operating an omnichannel business model with our online platform and 12 physical retail locations across major metropolitan areas. Peak season (November-December) represents approximately 40% of annual sales, creating significant demand forecasting and inventory management challenges. Our technology stack is Shopify-based with multiple third-party integrations for payments, shipping, marketing automation, and customer service. We work with approximately 200 suppliers, primarily apparel manufacturers in Southeast Asia and Southern Europe. Key procurement categories include merchandise (managed separately by our buying team), fulfillment and logistics, marketing services, technology and SaaS subscriptions, and store operations. Our procurement function is relatively lean with three team members managing approximately $15M in indirect spend. Strategic priorities include improving logistics cost efficiency, optimizing our marketing spend ROI, and reducing the complexity of our technology vendor landscape through consolidation.",
    "Grocery retail chain operating 45 stores across the Pacific Northwest region, serving approximately 500,000 customers weekly. Our business operates on thin margins (typically 2-3% net), requiring aggressive and sophisticated cost management across all categories. Private label products are growing as a percentage of sales, currently representing 22% of revenue, and this is a strategic priority area. Our procurement organization manages relationships with hundreds of suppliers across fresh produce, packaged goods, and store operations categories. We participate in a buying cooperative for national brand products but maintain direct relationships for regional and local suppliers. Key challenges include managing price volatility in fresh categories, ensuring supply chain resilience, and competing effectively against both traditional grocers and discount formats. We are investing in technology to improve demand forecasting, reduce shrinkage, and optimize promotional effectiveness. Annual procurement spend across all categories exceeds $400M.",
    "Luxury goods retailer with a global presence across 25 boutique locations in major cities including New York, London, Paris, Tokyo, and Dubai. Our brand positioning emphasizes exclusivity, craftsmanship, and exceptional customer experience, which significantly influences our procurement decisions and vendor relationships. We work primarily with artisan manufacturers and premium service providers who understand and can deliver to luxury standards. Customer experience is paramount, requiring high-touch service delivery and flawless execution across all touchpoints. Our sales model involves long relationship cycles with high-net-worth clients, often with bespoke or made-to-order products. Procurement categories include store design and fixtures, visual merchandising, premium packaging, events and hospitality, and corporate services. Vendor selection prioritizes quality, reliability, and brand alignment over cost optimization. Our procurement team works closely with creative and retail operations to ensure all vendor interactions reinforce our brand values. Annual indirect procurement spend is approximately $30M globally.",
  ],
  professional: [
    "Management consulting firm with approximately 300 consultants across five offices in major European business centers. Our practice areas include strategy, operations, digital transformation, and organizational change for clients across multiple industries. Knowledge management and intellectual property protection are critical given our business model depends on proprietary methodologies and client confidentiality. We have significant travel expenses given our client-facing delivery model, with consultants typically spending 3-4 days per week at client sites. Contractor and subcontractor utilization is substantial, representing approximately 20% of our delivery capacity during peak periods. Key procurement categories include travel and entertainment, professional development and training, technology and collaboration tools, office facilities, and external expertise. Our procurement function is relatively sophisticated with formal category management and preferred supplier programs. Strategic priorities include optimizing travel costs without impacting client relationships, improving knowledge management tools, and managing our flexible workforce more strategically. Annual indirect spend exceeds $25M.",
    "Law firm specializing in corporate mergers and acquisitions with 150 attorneys operating from offices in New York, London, and Hong Kong. We advise on complex cross-border transactions for Fortune 500 clients, requiring strict confidentiality and sophisticated information management. Our partnership model influences procurement decisions, with equity partners having significant input on major purchases and vendor relationships. Document management and eDiscovery represent major cost centers, particularly for litigation support activities. Key procurement categories include legal research platforms, practice management technology, document production services, facilities and real estate, and professional services. We maintain rigorous vendor due diligence processes given the sensitivity of client matters we handle. Procurement challenges include managing the transition to cloud-based solutions while maintaining security, optimizing our real estate footprint post-pandemic, and improving procurement data visibility across our international offices. Annual procurement spend is approximately $35M across all categories.",
    "Engineering services company providing design, project management, and construction supervision services primarily for infrastructure projects including transportation, water, and energy. Government contracts represent approximately 60% of our revenue, requiring DBE (Disadvantaged Business Enterprise) certification compliance and adherence to public procurement regulations. We employ 400 engineers, architects, and project managers across 8 regional offices. Our procurement needs include design software and technology, surveying equipment, fleet vehicles, subconsultant services, and office operations. Managing subconsultant relationships is particularly important given we often team with specialized firms on large pursuits. Compliance requirements for government work add complexity to our procurement processes, including detailed documentation of pricing, small business utilization reporting, and conflict of interest management. Our procurement function works closely with our contracts and compliance team to ensure we meet all regulatory requirements while achieving competitive pricing. Annual procurement spend is approximately $20M.",
  ],
};

const getRandomIndustryContext = (): string => {
  const industries = Object.values(industryContexts);
  const industry = randomChoice(industries);
  return randomChoice(industry);
};

// Scenario-specific data generators
const generators: Record<string, TestDataGenerator> = {
  "make-vs-buy": () => ({
    industryContext: getRandomIndustryContext(),
    internalSalary: randomCurrency(65000, 120000),
    recruitingCost: randomCurrency(8000, 25000),
    managementTime: randomNumber(8, 40).toString(),
    officeItPerHead: randomCurrency(5000, 15000),
    agencyFee: randomCurrency(80000, 250000),
    agencyOnboardingSpeed: randomNumber(5, 30).toString(),
    knowledgeRetentionRisk: randomChoice(["Low", "Medium", "High"]),
    qualityBenchmark: randomNumber(6, 10).toString(),
    peakLoadCapacity: randomChoice(["Yes", "No", "Partial"]),
    strategicImportance: randomNumber(4, 10).toString(),
  }),

  "tail-spend-sourcing": () => ({
    industryContext: getRandomIndustryContext(),
    purchaseAmount: randomCurrency(500, 15000),
    urgency: randomNumber(1, 30).toString(),
    catalogAvailable: randomChoice(["Yes", "No"]),
    quotesCount: randomNumber(0, 5).toString(),
    paymentTerms: randomChoice(["Corporate Card", "Invoice", "Purchase Order"]),
    warranty: randomChoice(["Yes", "No"]),
    deliveryCost: randomCurrency(0, 500),
    returnRisk: randomChoice(["Low", "Medium", "High"]),
    alternativesExist: randomChoice(["Yes", "No"]),
    approvalRequired: randomChoice(["Yes", "No"]),
  }),

  "supplier-review": () => ({
    industryContext: getRandomIndustryContext(),
    qualityScore: randomNumber(5, 10).toString(),
    onTimeDelivery: randomPercentage(75, 99),
    incidentCount: randomNumber(0, 8).toString(),
    communicationScore: randomNumber(5, 10).toString(),
    innovationScore: randomNumber(3, 10).toString(),
    financialStability: randomChoice(["Strong", "Moderate", "At Risk"]),
    socialResponsibility: randomChoice(["Certified", "In Progress", "None"]),
    priceVsMarket: randomChoice(["Below Market", "At Market", "Above Market"]),
    crisisSupport: randomChoice(["Excellent", "Good", "Poor"]),
    spendVolume: randomCurrency(100000, 5000000),
  }),

  "disruption-management": () => ({
    industryContext: getRandomIndustryContext(),
    deficitSku: randomChoice([
      "High-grade aluminum alloy sheets",
      "Custom ASIC chips",
      "Medical-grade silicone tubing",
      "Specialty lubricants",
      "Carbon fiber composite panels",
      "Pharmaceutical API compound",
    ]),
    stockDays: randomNumber(3, 45).toString(),
    altSuppliers: randomNumber(0, 4).toString(),
    altProducts: randomChoice(["Yes", "No", "Partial"]),
    substitutePrice: randomPercentage(5, 50),
    switchingTime: randomNumber(7, 90).toString(),
    lostRevenuePerDay: randomCurrency(10000, 500000),
    inTransitStatus: randomChoice(["Yes", "No", "Unknown"]),
    forceMajeureClause: randomChoice(["Yes", "No", "Unclear"]),
    competitorResponse: randomChoice([
      "Competitors facing similar issues",
      "Main competitor has secured alternative supply",
      "Industry-wide shortage reported",
      "Unknown at this time",
    ]),
  }),

  "risk-assessment": () => ({
    industryContext: getRandomIndustryContext(),
    assessmentSubject: randomChoice([
      "Primary logistics provider",
      "Critical component supplier",
      "IT infrastructure vendor",
      "Offshore manufacturing partner",
      "Raw material supplier",
    ]),
    annualValue: randomCurrency(500000, 10000000),
    marketVolatility: randomChoice(["Stable", "Moderate", "Volatile", "Highly Volatile"]),
    regulatoryExposure: randomChoice(["Minimal", "Moderate", "High", "Critical"]),
    geopoliticalRisk: randomChoice(["Low", "Medium", "High", "Critical"]),
    commodityDependency: randomChoice(["None", "Low", "Moderate", "High"]),
    contractType: randomChoice(["Spot/No Contract", "Short-term (<1yr)", "Medium-term (1-3yr)", "Long-term (3+yr)"]),
    liabilityProtection: randomChoice(["Comprehensive", "Standard", "Limited", "None"]),
    terminationRights: randomChoice(["Flexible", "Moderate Notice", "Restrictive", "Locked In"]),
    priceAdjustmentMechanism: randomChoice(["Fixed", "Index-linked", "Negotiable", "Supplier Discretion"]),
    currentChallenges: randomChoice([
      "Supplier announced 15% price increase effective Q2. Lead times extended from 4 to 8 weeks. Quality scores stable.",
      "Recent capacity expansion by supplier should improve availability. Currency volatility affecting landed cost. New CEO appointed.",
      "Port congestion causing delays. Supplier's main facility in earthquake-prone zone. No recent incidents but insurance costs rising.",
      "Raw material shortage upstream affecting supplier. Two quality escapes in past quarter. Supplier investing in automation.",
    ]),
    supplierFinancialHealth: randomChoice(["Strong", "Stable", "Concerning", "At Risk"]),
    supplyChainVisibility: randomChoice(["Full Visibility", "Tier 1 Only", "Limited", "None"]),
    recentIncidents: randomChoice([
      "Minor quality issue in Q3, resolved with corrective action. No delivery delays.",
      "Two late deliveries due to logistics issues. No quality problems reported.",
      "Clean record for past 12 months. Annual audit passed with minor findings.",
      "",
    ]),
    businessCriticality: randomChoice(["Low", "Medium", "High", "Mission Critical"]),
    recoveryTime: randomChoice(["Hours", "Days", "Weeks", "Months"]),
  }),

  "tco-analysis": () => ({
    industryContext: getRandomIndustryContext(),
    assetDescription: randomChoice([
      "Industrial CNC machining center with 5-axis capability",
      "Enterprise ERP system implementation",
      "Fleet of 20 electric delivery vehicles",
      "Automated warehouse picking system",
      "Commercial HVAC system for new facility",
    ]),
    ownershipPeriod: randomNumber(5, 15).toString(),
    purchasePrice: randomCurrency(250000, 2000000),
    installationCost: randomCurrency(15000, 150000),
    trainingCost: randomCurrency(5000, 50000),
    integrationCost: randomCurrency(10000, 100000),
    annualMaintenance: randomCurrency(15000, 100000),
    energyConsumption: randomCurrency(5000, 50000),
    consumablesCost: randomCurrency(2000, 30000),
    laborCost: randomCurrency(20000, 80000),
    insuranceCost: randomCurrency(2000, 20000),
    vendorLockInRisk: randomChoice(["None", "Low", "Moderate", "High", "Critical"]),
    proprietaryComponents: randomPercentage(10, 80),
    alternativeSuppliers: randomChoice(["Many", "Some", "Few", "None"]),
    dataPortability: randomChoice(["Full Export", "Partial", "Difficult", "Locked In"]),
    technologyObsolescence: randomChoice(["Low", "Medium", "High", "Imminent"]),
    marketPriceTrend: randomChoice(["Decreasing", "Stable", "Increasing", "Volatile"]),
    regulatoryChanges: randomChoice(["Minimal", "Possible", "Likely", "Certain"]),
    inflationAssumption: randomPercentage(2, 6),
    currencyExposure: randomChoice(["None", "Low", "Moderate", "High"]),
    interestRate: randomPercentage(4, 12),
    residualValue: randomCurrency(25000, 300000),
    decommissioningCost: randomCurrency(5000, 50000),
    dataMigrationCost: randomCurrency(10000, 80000),
    downtimeRisk: randomChoice(["Very High (99%+)", "High (97-99%)", "Moderate (95-97%)", "Low (<95%)"]),
    downtimeCostPerHour: randomCurrency(1000, 50000),
  }),

  "software-licensing": () => ({
    industryContext: getRandomIndustryContext(),
    softwareName: randomChoice([
      "Salesforce Sales Cloud",
      "Microsoft 365 Enterprise",
      "SAP S/4HANA",
      "Adobe Creative Cloud",
      "Slack Enterprise Grid",
      "Atlassian Suite",
      "ServiceNow ITSM",
    ]),
    softwareCategory: randomChoice(["Productivity Suite", "CRM/Sales", "ERP", "Development Tools", "Design/Creative", "Analytics/BI", "Communication"]),
    totalUsers: randomNumber(50, 1000).toString(),
    powerUsers: randomNumber(10, 100).toString(),
    regularUsers: randomNumber(20, 400).toString(),
    occasionalUsers: randomNumber(20, 500).toString(),
    externalUsers: randomNumber(0, 100).toString(),
    userGrowthRate: randomPercentage(5, 30),
    perUserMonthly: randomCurrency(10, 150),
    enterpriseTierCost: randomCurrency(50000, 500000),
    usageBasedRate: randomCurrency(1, 10),
    implementationCost: randomCurrency(20000, 200000),
    contractLength: randomChoice(["Month-to-Month", "1 Year", "2 Years", "3 Years"]),
    longTermDiscount: randomPercentage(5, 30),
    annualEscalation: randomPercentage(3, 8),
    paymentTerms: randomChoice(["Monthly", "Quarterly", "Annual Upfront"]),
    terminationClause: randomChoice(["Free Exit", "Prorated Refund", "No Refund", "Penalty Fee"]),
    dataExportability: randomChoice(["Full Export (Standard Formats)", "Export with Limitations", "Difficult Export", "Proprietary Format Only"]),
    integrationDependency: randomChoice(["Standalone", "Light Integration", "Moderate Integration", "Deep Integration"]),
    switchingCostEstimate: randomCurrency(30000, 300000),
    alternativeProducts: randomChoice(["Many (5+)", "Some (2-4)", "Few (1-2)", "None"]),
    proprietaryFeatures: randomChoice(["None", "Low", "Moderate", "High"]),
    vendorStability: randomChoice(["Market Leader", "Established", "Growing", "Startup/At Risk"]),
    complianceRequirements: randomChoice(["SOC2, GDPR", "HIPAA, SOC2", "ISO 27001", "PCI-DSS", ""]),
    currentSolution: randomChoice(["Legacy on-premise system", "Competitor SaaS product", "Manual spreadsheets", ""]),
    currentAnnualCost: randomCurrency(30000, 200000),
  }),

  "risk-matrix": () => ({
    industryContext: getRandomIndustryContext(),
    legalStatus: randomChoice(["Verified", "Pending", "Issues Found"]),
    lawsuits: randomChoice(["None", "Minor", "Significant"]),
    dataAccess: randomChoice(["None", "Limited", "Sensitive", "Critical"]),
    financialHealth: randomChoice(["Strong", "Moderate", "Weak"]),
    concentration: randomChoice(["Diversified", "Moderate", "Single Client"]),
    environmentalRisk: randomChoice(["Low", "Medium", "High"]),
    sanctionsRisk: randomChoice(["None", "Low", "Medium", "High"]),
    cyberSecurity: randomChoice(["Certified", "Adequate", "Concerning"]),
    insurance: randomChoice(["Comprehensive", "Basic", "None"]),
    siteAudits: randomChoice(["Recent", "Outdated", "Never"]),
  }),

  "sow-critic": () => ({
    industryContext: getRandomIndustryContext(),
    sowText: `STATEMENT OF WORK

1. SCOPE
Provider shall deliver a comprehensive digital transformation solution including:
- Migration of legacy systems to cloud infrastructure
- Implementation of new CRM platform
- Training for up to 50 end users
- 12-month post-implementation support

2. DELIVERABLES
- Technical architecture document
- Migrated and tested cloud environment
- Configured CRM with custom workflows
- User training materials and sessions
- Monthly status reports

3. TIMELINE
Project duration: 6 months from contract signing
Phase 1 (Discovery): Weeks 1-4
Phase 2 (Build): Weeks 5-16
Phase 3 (Testing): Weeks 17-20
Phase 4 (Go-Live): Weeks 21-24

4. ACCEPTANCE
Client shall review each deliverable within 10 business days. Silence constitutes acceptance.

5. PAYMENT
50% upon signing, 25% at Phase 2 completion, 25% at Go-Live.`,
    deliverables: "Cloud environment, CRM implementation, training, documentation, 12-month support",
    acceptanceCriteria: "Client review within 10 business days, silence = acceptance",
    timeline: "6 months total, 4 phases as outlined in SOW",
    responsibilities: "Provider: all technical work. Client: provide access, attend training, approve deliverables",
    clientResources: "VPN access, sandbox environment, subject matter experts availability",
    exclusions: "Hardware procurement, third-party license costs, data cleansing",
    changeProcess: "Not explicitly defined in current SOW",
    penalties: "None defined",
    warrantyPeriod: "12-month support included",
  }),

  "sla-definition": () => ({
    industryContext: getRandomIndustryContext(),
    operatingHours: randomChoice(["24/7", "Business Hours (8/5)", "Extended (12/6)"]),
    responseTime: randomChoice(["1 hour", "4 hours", "8 hours", "24 hours"]),
    resolutionTime: randomChoice(["4 hours", "8 hours", "24 hours", "72 hours"]),
    allowedDowntime: randomPercentage(0, 5),
    serviceCriticality: randomChoice(["Mission Critical", "Important", "Standard"]),
    contactMethods: randomChoice([
      "Email, Phone, Ticketing System",
      "Dedicated Slack channel, Phone hotline",
      "Web portal only",
    ]),
    escalationProcess: randomChoice([
      "Tier 1 → Tier 2 (after 2 hours) → Management (after 8 hours)",
      "All issues directly to account manager",
      "Standard ticketing queue with priority flags",
    ]),
    reportingFrequency: randomChoice(["Weekly", "Monthly", "Quarterly"]),
    qualityBonuses: randomChoice([
      "5% rebate for >99.5% uptime",
      "None",
      "Free additional service month for zero incidents",
    ]),
  }),

  "rfp-generator": () => ({
    industryContext: getRandomIndustryContext(),
    procurementSubject: randomChoice([
      "IT Managed Services for 3-year term",
      "Commercial cleaning services for headquarters",
      "Employee benefits administration",
      "Fleet management and telematics solution",
      "Corporate travel management services",
    ]),
    volume: randomChoice([
      "Approximately 200 employees, 3 office locations",
      "$2M annual spend under management",
      "50 vehicles across 5 states",
      "Single facility, 100,000 sq ft",
    ]),
    technicalRequirements: "See detailed specification in Attachment A. Key requirements include 24/7 support, SLA of 99.5% uptime, integration with existing systems.",
    supplierQualifications: "Minimum 5 years in business, 3 comparable references, relevant certifications (ISO 27001, SOC2), $5M liability insurance",
    location: randomChoice([
      "Chicago, IL metropolitan area",
      "Remote delivery acceptable with quarterly on-site visits",
      "Multiple US locations - see Attachment B",
    ]),
    submissionDeadline: "30 days from RFP issue date",
    priceStructure: "Fixed monthly fee with usage tiers. Breakdown by: base fee, per-user costs, professional services rates",
    evaluationWeights: "Price 35%, Technical Capability 30%, Experience 20%, Implementation Plan 15%",
    ndaTerms: randomChoice(["Standard NDA", "Custom NDA", "None Required"]),
    responseFormat: "Structured response following provided template. Maximum 30 pages plus attachments.",
  }),

  "volume-consolidation": () => ({
    industryContext: getRandomIndustryContext(),
    suppliers: randomNumber(5, 15).toString(),
    totalSpend: randomCurrency(1000000, 20000000),
    topSupplierShare: randomPercentage(15, 45),
    qualityVariance: randomChoice(["Low", "Medium", "High"]),
    switchingCost: randomChoice(["Low", "Medium", "High"]),
    contractsExpiring: randomNumber(2, 8).toString(),
  }),

  "category-strategy": () => ({
    industryContext: getRandomIndustryContext(),
    categoryName: randomChoice([
      "Packaging Materials",
      "IT Hardware",
      "Professional Services",
      "Logistics and Transportation",
      "Marketing Services",
      "MRO Supplies",
    ]),
    annualSpend: randomCurrency(500000, 15000000),
    supplierCount: randomNumber(3, 25).toString(),
    marketConcentration: randomChoice(["Fragmented", "Moderate", "Concentrated", "Oligopoly"]),
    switchingBarrier: randomChoice(["Low", "Medium", "High"]),
    strategicImportance: randomChoice(["Low", "Medium", "High", "Critical"]),
    supplyRisk: randomChoice(["Low", "Medium", "High"]),
    currentContract: randomChoice(["Spot buying", "Annual contracts", "Multi-year agreement", "Framework agreement"]),
  }),

  "cost-breakdown": () => ({
    industryContext: getRandomIndustryContext(),
    productName: randomChoice([
      "Custom injection-molded plastic housing",
      "Precision machined aluminum bracket",
      "Printed circuit board assembly",
      "Specialty adhesive compound",
    ]),
    unitPrice: randomCurrency(10, 500),
    annualVolume: randomNumber(1000, 100000).toString(),
    materialCost: randomPercentage(30, 60),
    laborCost: randomPercentage(15, 35),
    overheadCost: randomPercentage(10, 25),
    profitMargin: randomPercentage(5, 20),
    toolingAmortization: randomCurrency(0, 50000),
    logisticsCost: randomPercentage(3, 12),
  }),

  "negotiation-prep": () => ({
    industryContext: getRandomIndustryContext(),
    counterparty: randomChoice([
      "Global logistics provider",
      "Regional IT services company",
      "Specialty chemical supplier",
      "Large consulting firm",
    ]),
    negotiationType: randomChoice(["Contract renewal", "New supplier", "Price increase pushback", "Scope expansion"]),
    currentSpend: randomCurrency(200000, 5000000),
    relationshipYears: randomNumber(1, 15).toString(),
    batna: randomChoice([
      "Qualified backup supplier at 10% premium",
      "Insourcing capability exists",
      "Limited alternatives available",
      "Strong alternative shortlisted",
    ]),
    targetOutcome: randomChoice([
      "5-10% cost reduction",
      "Extended payment terms",
      "Improved SLA commitments",
      "Volume flexibility",
    ]),
  }),
};

/**
 * Generates test data for a given scenario type
 * Returns form data that fills required fields with realistic values
 */
export function generateTestData(scenarioId: string): Record<string, string> {
  const generator = generators[scenarioId];
  
  if (!generator) {
    console.warn(`[TestDataFactory] No generator found for scenario: ${scenarioId}`);
    // Return minimal fallback data
    return {
      industryContext: getRandomIndustryContext(),
    };
  }
  
  return generator();
}

/**
 * Get list of all supported scenario IDs
 */
export function getSupportedScenarios(): string[] {
  return Object.keys(generators);
}
