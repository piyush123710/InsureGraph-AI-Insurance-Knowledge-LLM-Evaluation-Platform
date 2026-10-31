import { GraphEntity, GraphRelationship } from '../../src/types/index.ts';

export const INITIAL_GRAPH_ENTITIES: GraphEntity[] = [
  // Providers
  {
    id: 'prov-vanguard',
    name: 'Vanguard Underwriting Inc.',
    type: 'Insurance Provider',
    description: 'Tier-1 primary health and commercial property underwriter with AM Best A+ rating.',
    properties: { rating: 'A+', headquarters: 'Boston, MA', licenseNo: 'MA-99201' }
  },
  {
    id: 'prov-aegis',
    name: 'Aegis Assurance Corp',
    type: 'Insurance Provider',
    description: 'Specialty fleet motor and global travel reinsurance syndicate.',
    properties: { rating: 'AA-', headquarters: 'Chicago, IL', licenseNo: 'IL-44109' }
  },

  // Customers
  {
    id: 'cust-eleanor',
    name: 'Eleanor Vance',
    type: 'Customer',
    description: 'Individual policyholder with primary health shield and apex term life.',
    properties: { age: 38, tier: 'Platinum', occupation: 'Biomedical Engineer', location: 'Cambridge, MA' }
  },
  {
    id: 'cust-marcus',
    name: 'Marcus Sterling',
    type: 'Customer',
    description: 'Frequent business traveler and executive holder of travel & health policies.',
    properties: { age: 46, tier: 'Gold', occupation: 'Global Logistics Director', location: 'New York, NY' }
  },
  {
    id: 'cust-horizon',
    name: 'Horizon Freight Solutions LLC',
    type: 'Customer',
    description: 'Commercial fleet enterprise owning 45 freight transit trucks.',
    properties: { fleetSize: 45, industry: 'Interstate Freight', annualRevenue: '$28M', location: 'Columbus, OH' }
  },
  {
    id: 'cust-sarah',
    name: 'Sarah Jenkins',
    type: 'Customer',
    description: 'Small commercial business owner holding commercial property & BI insurance.',
    properties: { age: 52, tier: 'Silver', industry: 'Specialty Retail & Bakery', location: 'Seattle, WA' }
  },

  // Policies
  {
    id: 'pol-health-01',
    name: 'Premier Health Shield 2026',
    type: 'Insurance Policy',
    description: 'Comprehensive health coverage with $500,000 annual aggregate limit.',
    properties: { policyNo: 'PHS-2026-88102', sumInsured: '$500,000', deductible: '$1,000', effectiveDate: '2026-01-01' }
  },
  {
    id: 'pol-motor-02',
    name: 'Commercial Fleet Auto Policy 2026',
    type: 'Insurance Policy',
    description: 'All-risk commercial motor fleet protection with $1M 3rd party liability.',
    properties: { policyNo: 'CFA-2026-11904', vehiclesCovered: 45, compulsoryExcess: '$500', effectiveDate: '2026-01-15' }
  },
  {
    id: 'pol-life-03',
    name: 'Apex Term Life & 36 Rider',
    type: 'Insurance Policy',
    description: 'Term death protection with accelerated terminal illness and critical illness riders.',
    properties: { policyNo: 'ATL-2026-44021', sumAssured: '$750,000', termYears: 25, effectiveDate: '2025-06-01' }
  },
  {
    id: 'pol-prop-04',
    name: 'Commercial Property & BI Policy',
    type: 'Insurance Policy',
    description: 'All-risk physical building, inventory, and 12-month business interruption coverage.',
    properties: { policyNo: 'CPB-2026-66311', buildingValue: '$2,400,000', indemnityMonths: 12, effectiveDate: '2026-03-01' }
  },
  {
    id: 'pol-travel-05',
    name: 'Global Explorer Travel Medical',
    type: 'Insurance Policy',
    description: 'Worldwide international travel medical and emergency evacuation plan.',
    properties: { policyNo: 'GET-2026-90234', medicalLimit: '$1,000,000', evacuationLimit: '$500,000', effectiveDate: '2026-04-10' }
  },

  // Coverages
  {
    id: 'cov-inpatient',
    name: 'Inpatient Hospitalization Coverage',
    type: 'Coverage',
    description: 'Continuous hospitalization accommodation, room, nursing, and specialist fees.',
    properties: { minimumStayHours: 24, roomCap: 'Standard Single Room' }
  },
  {
    id: 'cov-icu',
    name: 'Intensive Care Unit (ICU) Sub-Limit',
    type: 'Coverage',
    description: 'Specialized intensive critical care monitoring and life-support.',
    properties: { dailyCap: '$2,500/day' }
  },
  {
    id: 'cov-daycare',
    name: 'Day Care Surgical Procedures',
    type: 'Coverage',
    description: 'Advanced medical procedures requiring less than 24 hours hospitalization.',
    properties: { proceduresCovered: 540, copay: '0%' }
  },
  {
    id: 'cov-tp-liab',
    name: 'Third-Party Bodily Injury & Property',
    type: 'Coverage',
    description: 'Statutory unlimited bodily injury and $1,000,000 property damage indemnity.',
    properties: { propertyCap: '$1,000,000', bodilyInjury: 'Unlimited Statutory' }
  },
  {
    id: 'cov-critical',
    name: '36 Critical Illness Rider Benefit',
    type: 'Coverage',
    description: 'Lump-sum 100% rider payment upon primary diagnosis of covered conditions.',
    properties: { illnessesCount: 36, survivalDays: 30, waitingPeriodDays: 90 }
  },
  {
    id: 'cov-bi-profit',
    name: 'Business Interruption Gross Profit',
    type: 'Coverage',
    description: 'Indemnity for gross profit reduction and additional working cost post property loss.',
    properties: { maxIndemnity: '12 Months', accountantFees: '$20,000' }
  },
  {
    id: 'cov-evac',
    name: 'International Emergency Medical Evacuation',
    type: 'Coverage',
    description: 'Air ambulance and medical repatriation to competent facility or home country.',
    properties: { limit: '$500,000', provider: 'Global SOS Air Link' }
  },

  // Medical Treatments
  {
    id: 'med-appendectomy',
    name: 'Laparoscopic Appendectomy',
    type: 'Medical Treatment',
    description: 'Minimally invasive emergency excision of acutely inflamed appendix.',
    properties: { cptCode: '44970', avgDuration: '1.5 hours', hospitalizationDays: 2 }
  },
  {
    id: 'med-bypass',
    name: 'Coronary Artery Bypass Graft (CABG)',
    type: 'Medical Treatment',
    description: 'Open heart surgical grafting restoring blood flow to ischemic myocardium.',
    properties: { cptCode: '33533', avgCost: '$88,000', recoveryWeeks: 8 }
  },
  {
    id: 'med-chemo',
    name: 'Chemotherapy Infusion Regimen',
    type: 'Medical Treatment',
    description: 'Day care antineoplastic intravenous protocol for targeted oncology care.',
    properties: { dayCareProcedure: true, cycles: 6 }
  },

  // Vehicles
  {
    id: 'veh-freightliner',
    name: 'Freightliner Cascadia 2024 (FL-881)',
    type: 'Vehicle',
    description: 'Heavy duty class-8 commercial tractor trailer in interstate transit.',
    properties: { vin: '1FUJGLDR5PL91823', class: 'Class 8 Heavy Duty', trackerActive: true }
  },
  {
    id: 'veh-transit',
    name: 'Ford Transit Cargo Van 2025 (FT-204)',
    type: 'Vehicle',
    description: 'Urban delivery medium cargo van with refrigerated insulated bay.',
    properties: { vin: '1FTBR1Y88RKA10294', capacity: '3,800 lbs', refrigerated: true }
  },

  // Premiums
  {
    id: 'prem-health',
    name: 'Annual Health Premium ($1,420)',
    type: 'Premium',
    description: 'Standard individual annual health premium billing schedule.',
    properties: { amount: 1420, frequency: 'Annual', paymentMethod: 'ACH Autopay' }
  },
  {
    id: 'prem-fleet',
    name: 'Fleet Commercial Premium ($14,800)',
    type: 'Premium',
    description: 'Enterprise fleet quarterly installment schedule.',
    properties: { amount: 14800, frequency: 'Quarterly', discountNCD: '15%' }
  },
  {
    id: 'prem-life',
    name: 'Term Life Annual Premium ($860)',
    type: 'Premium',
    description: 'Level 25-year guaranteed term premium.',
    properties: { amount: 860, frequency: 'Annual', gracePeriodDays: 30 }
  },

  // Exclusions
  {
    id: 'exc-preexist',
    name: '24-Month Pre-Existing Disease Exclusion',
    type: 'Exclusion',
    description: 'Pre-existing medical conditions diagnosed prior to inception require 24 months continuous tenure.',
    properties: { clause: 'Section 3.1', waitingPeriodMonths: 24 }
  },
  {
    id: 'exc-cosmetic',
    name: 'Cosmetic & Elective Aesthetic Exclusion',
    type: 'Exclusion',
    description: 'Rhinoplasty, body contouring, cosmetic adjustments excluded unless post-trauma reconstruction.',
    properties: { clause: 'Section 3.2', exception: 'Accidental trauma, burns, cancer resection' }
  },
  {
    id: 'exc-dui',
    name: 'Intoxication & DUI Exclusion (0.00% BAC)',
    type: 'Exclusion',
    description: 'Strict zero-tolerance alcohol and narcotic operation clause.',
    properties: { clause: 'Section 3.2', threshold: '0.00% BAC' }
  },
  {
    id: 'exc-cyber',
    name: 'Commercial Cyber & Ransomware Exclusion',
    type: 'Exclusion',
    description: 'Physical property policies exclude software attacks and ransomware losses.',
    properties: { clause: 'Section 3.1', requiredEndorsement: 'CR-01' }
  },
  {
    id: 'exc-suicide',
    name: '12-Month Suicide Exclusion Clause',
    type: 'Exclusion',
    description: 'Suicide within 12 months refunds paid premiums only without death benefit.',
    properties: { clause: 'Section 3.1', durationMonths: 12 }
  },

  // Claims
  {
    id: 'clm-2026-881',
    name: 'Claim #CLM-2026-881: Acute Appendectomy',
    type: 'Claim',
    description: 'Emergency hospitalization claim for acute appendicitis at Mass General Hospital.',
    properties: { claimAmount: '$14,250', approvedAmount: '$13,250', deductibleApplied: '$1,000', status: 'Settled' }
  },
  {
    id: 'clm-2026-882',
    name: 'Claim #CLM-2026-882: Fleet Highway Jackknife',
    type: 'Claim',
    description: 'Interstate 80 multi-vehicle winter collision involving Freightliner Cascadia FL-881.',
    properties: { claimAmount: '$42,000', status: 'Under Investigation', surveyorAssigned: 'Apex Adjusters' }
  },
  {
    id: 'clm-2026-883',
    name: 'Claim #CLM-2026-883: Zurich Hospitalization & Evac',
    type: 'Claim',
    description: 'Sudden severe altitude sickness and pulmonary edema in Swiss Alps.',
    properties: { claimAmount: '$74,500', status: 'Approved', assistanceProvider: 'Global SOS' }
  }
];

export const INITIAL_GRAPH_RELATIONSHIPS: GraphRelationship[] = [
  // Provider to Policy
  { id: 'rel-01', source: 'prov-vanguard', target: 'pol-health-01', type: 'POLICY_ISSUED_BY_PROVIDER' },
  { id: 'rel-02', source: 'prov-vanguard', target: 'pol-prop-04', type: 'POLICY_ISSUED_BY_PROVIDER' },
  { id: 'rel-03', source: 'prov-vanguard', target: 'pol-life-03', type: 'POLICY_ISSUED_BY_PROVIDER' },
  { id: 'rel-04', source: 'prov-aegis', target: 'pol-motor-02', type: 'POLICY_ISSUED_BY_PROVIDER' },
  { id: 'rel-05', source: 'prov-aegis', target: 'pol-travel-05', type: 'POLICY_ISSUED_BY_PROVIDER' },

  // Customer to Policy
  { id: 'rel-06', source: 'cust-eleanor', target: 'pol-health-01', type: 'CUSTOMER_OWNS_POLICY' },
  { id: 'rel-07', source: 'cust-eleanor', target: 'pol-life-03', type: 'CUSTOMER_OWNS_POLICY' },
  { id: 'rel-08', source: 'cust-marcus', target: 'pol-travel-05', type: 'CUSTOMER_OWNS_POLICY' },
  { id: 'rel-09', source: 'cust-marcus', target: 'pol-health-01', type: 'CUSTOMER_OWNS_POLICY' },
  { id: 'rel-10', source: 'cust-horizon', target: 'pol-motor-02', type: 'CUSTOMER_OWNS_POLICY' },
  { id: 'rel-11', source: 'cust-sarah', target: 'pol-prop-04', type: 'CUSTOMER_OWNS_POLICY' },

  // Policy to Coverage
  { id: 'rel-12', source: 'pol-health-01', target: 'cov-inpatient', type: 'POLICY_PROVIDES_COVERAGE' },
  { id: 'rel-13', source: 'pol-health-01', target: 'cov-icu', type: 'POLICY_PROVIDES_COVERAGE' },
  { id: 'rel-14', source: 'pol-health-01', target: 'cov-daycare', type: 'POLICY_PROVIDES_COVERAGE' },
  { id: 'rel-15', source: 'pol-motor-02', target: 'cov-tp-liab', type: 'POLICY_PROVIDES_COVERAGE' },
  { id: 'rel-16', source: 'pol-life-03', target: 'cov-critical', type: 'POLICY_PROVIDES_COVERAGE' },
  { id: 'rel-17', source: 'pol-prop-04', target: 'cov-bi-profit', type: 'POLICY_PROVIDES_COVERAGE' },
  { id: 'rel-18', source: 'pol-travel-05', target: 'cov-evac', type: 'POLICY_PROVIDES_COVERAGE' },

  // Policy to Exclusion
  { id: 'rel-19', source: 'pol-health-01', target: 'exc-preexist', type: 'POLICY_HAS_EXCLUSION' },
  { id: 'rel-20', source: 'pol-health-01', target: 'exc-cosmetic', type: 'POLICY_HAS_EXCLUSION' },
  { id: 'rel-21', source: 'pol-motor-02', target: 'exc-dui', type: 'POLICY_HAS_EXCLUSION' },
  { id: 'rel-22', source: 'pol-life-03', target: 'exc-suicide', type: 'POLICY_HAS_EXCLUSION' },
  { id: 'rel-23', source: 'pol-prop-04', target: 'exc-cyber', type: 'POLICY_HAS_EXCLUSION' },

  // Policy to Premium
  { id: 'rel-24', source: 'pol-health-01', target: 'prem-health', type: 'POLICY_HAS_PREMIUM' },
  { id: 'rel-25', source: 'pol-motor-02', target: 'prem-fleet', type: 'POLICY_HAS_PREMIUM' },
  { id: 'rel-26', source: 'pol-life-03', target: 'prem-life', type: 'POLICY_HAS_PREMIUM' },

  // Coverage to Medical Treatment
  { id: 'rel-27', source: 'cov-inpatient', target: 'med-appendectomy', type: 'COVERAGE_INCLUDES_TREATMENT' },
  { id: 'rel-28', source: 'cov-inpatient', target: 'med-bypass', type: 'COVERAGE_INCLUDES_TREATMENT' },
  { id: 'rel-29', source: 'cov-daycare', target: 'med-chemo', type: 'COVERAGE_INCLUDES_TREATMENT' },
  { id: 'rel-30', source: 'cov-critical', target: 'med-bypass', type: 'COVERAGE_INCLUDES_TREATMENT' },

  // Customer to Claim
  { id: 'rel-31', source: 'cust-eleanor', target: 'clm-2026-881', type: 'CUSTOMER_SUBMITS_CLAIM' },
  { id: 'rel-32', source: 'cust-horizon', target: 'clm-2026-882', type: 'CUSTOMER_SUBMITS_CLAIM' },
  { id: 'rel-33', source: 'cust-marcus', target: 'clm-2026-883', type: 'CUSTOMER_SUBMITS_CLAIM' },

  // Claim to Policy
  { id: 'rel-34', source: 'clm-2026-881', target: 'pol-health-01', type: 'CLAIM_RELATES_TO_POLICY' },
  { id: 'rel-35', source: 'clm-2026-882', target: 'pol-motor-02', type: 'CLAIM_RELATES_TO_POLICY' },
  { id: 'rel-36', source: 'clm-2026-883', target: 'pol-travel-05', type: 'CLAIM_RELATES_TO_POLICY' },

  // Claim to Treatment / Vehicle
  { id: 'rel-37', source: 'clm-2026-881', target: 'med-appendectomy', type: 'CLAIM_INVOLVES_TREATMENT' },
  { id: 'rel-38', source: 'clm-2026-882', target: 'veh-freightliner', type: 'CLAIM_INVOLVES_VEHICLE' }
];
