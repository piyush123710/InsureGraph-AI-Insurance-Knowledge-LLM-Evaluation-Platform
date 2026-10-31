export interface RawSampleDoc {
  id: string;
  name: string;
  category: 'health' | 'motor' | 'life' | 'property' | 'travel';
  policyType: string;
  version: string;
  summary: string;
  content: string;
}

export const SAMPLE_DOCUMENTS: RawSampleDoc[] = [
  {
    id: 'doc-health-2026',
    name: 'Premier Health Shield Policy 2026.pdf',
    category: 'health',
    policyType: 'Comprehensive Health Insurance',
    version: 'v4.2-2026',
    summary: 'Comprehensive individual and family medical coverage covering inpatient hospitalization, ICU sub-limits, pre- and post-hospitalization, organ donor expenses, and specific 24-month pre-existing exclusions.',
    content: `
SECTION 1: INSURING AGREEMENT & COVERAGE SCOPE
1.1 Inpatient Hospitalization: The Company agrees to pay or indemnify the Insured for Eligible Medical Expenses incurred during continuous hospital confinement of at least 24 hours. Covered expenses include room and board, nursing care, surgeon, anesthetist, medical practitioner fees, intensive care unit (ICU) charges up to $2,500 per day, and pharmaceuticals administered during hospitalization.
1.2 Day Care Procedures: Day care treatments that require less than 24 hours hospitalization due to technological advancements in medical science (e.g., dialysis, chemotherapy, cataract surgery, radiotherapy) are covered up to the full Sum Insured limit.
1.3 Pre-Hospitalization Medical Expenses: Medical expenses incurred up to 60 days immediately preceding the date of hospital admission are eligible for reimbursement, provided such expenses are directly related to the condition for which hospitalization occurred.
1.4 Post-Hospitalization Medical Expenses: Medical expenses incurred up to 90 days immediately following the date of discharge from the hospital are eligible for reimbursement for follow-up consultations, diagnostic testing, and prescribed medications directly related to the same medical condition.
1.5 Organ Donor Expenses: Medical expenses incurred by the organ donor for the harvesting of organs during organ transplant surgery are covered up to a maximum limit of $25,000, provided the Insured is the recipient.
1.6 Emergency Road Ambulance: Emergency ambulance transportation by a registered ambulance service provider to the nearest hospital is covered up to $500 per hospitalization event.

SECTION 2: DEDUCTIBLES, CO-PAYMENTS & LIMITS
2.1 Annual Standard Deductible: A standard non-cumulative deductible of $1,000 applies per policy year per insured person before any benefits become payable under Section 1.
2.2 Non-Network Co-Payment: A 10% co-payment applies to all eligible expenses incurred at non-network medical facilities or hospitals outside the preferred provider network.
2.3 ICU Sub-Limit: Daily Intensive Care Unit charges are capped at $2,500 per day. Any excess room or ICU charges beyond this threshold remain the sole responsibility of the policyholder.
2.4 Sum Insured Aggregate Cap: The maximum aggregate liability of the Company under this policy in any one policy year shall not exceed $500,000.

SECTION 3: GENERAL EXCLUSIONS & LIMITATIONS
3.1 Pre-Existing Diseases (PED): Any condition, ailment, or injury diagnosed or treated within 24 months prior to the inception of this policy is excluded from coverage until the Insured has maintained continuous coverage under this policy for 24 months without lapse.
3.2 Cosmetic or Plastic Surgery: Expenses incurred for cosmetic, aesthetic, or reconstructive surgery, including breast reduction or enlargement, are excluded, UNLESS medically necessitated as reconstructive surgery following accidental trauma, burns, or cancer resection.
3.3 Self-Inflicted Injuries: Any injury, illness, or medical crisis arising directly or indirectly from intentional self-infliction, attempted suicide, or participation in unlawful or criminal acts is strictly excluded.
3.4 Experimental & Unproven Treatments: Any medication, therapeutic regimen, or surgical device not approved by the Food and Drug Administration (FDA) or local health authority as standard clinical protocol is excluded.
3.5 Hazardous Sports & Military Hazards: Injury sustained while engaging in professional motor racing, scuba diving below 30 meters, skydiving, or active participation in war, invasion, or nuclear radiation contamination is excluded.

SECTION 4: CLAIMS PROCEDURE & REQUIREMENTS
4.1 Emergency Admission Notification: In case of emergency hospitalization, notice must be given to the Third-Party Administrator (TPA) within 24 hours of hospital admission.
4.2 Planned Admission Notification: In case of planned elective hospitalization, prior pre-authorization must be submitted at least 72 hours prior to the scheduled date of admission.
4.3 Claim Submission Timeline: All claim documents, including itemized hospital bills, discharge summary, pharmacy receipts, and physician reports, must be submitted to the Company within 30 calendar days of hospital discharge.
4.4 Cashless Facility: Cashless settlement is available exclusively at network partner hospitals upon verification of active policy status and issuance of pre-authorization approval.
`
  },
  {
    id: 'doc-motor-2026',
    name: 'Commercial Motor Fleet Comprehensive Policy 2026.pdf',
    category: 'motor',
    policyType: 'Commercial Fleet Vehicle Coverage',
    version: 'v3.1-2026',
    summary: 'Comprehensive commercial fleet protection covering vehicle collision damage, fire, theft, third-party bodily injury and property damage, with strict licensing and DUI exclusions.',
    content: `
SECTION 1: OWN DAMAGE COVERAGE
1.1 Loss or Damage to Insured Vehicle: The Insurer will indemnify the Insured against physical loss or damage to any scheduled vehicle in the commercial fleet caused by: accidental external collision, overturning, fire, explosion, lightning, self-ignition, burglary, housebreaking or theft, malicious damage, riot, strike, earthquake, flood, storm, and tempest.
1.2 Towing & Recovery Expenses: If the vehicle is disabled due to a covered accident, the Insurer will reimburse the reasonable cost of towing the vehicle to the nearest authorized commercial repair workshop up to $300 per breakdown or collision occurrence.
1.3 Windscreen and Window Glass: Replacement or repair of damaged windshield or window glass does not affect the fleet No-Claim Discount (NCD), provided the claim does not involve other vehicle body damage.

SECTION 2: THIRD PARTY LIABILITY
2.1 Death or Bodily Injury: The Insurer will indemnify the Insured in respect of all sums that the Insured becomes legally liable to pay for death or bodily injury to any third-party person resulting from the operation or maintenance of the scheduled vehicle, with unlimited statutory liability.
2.2 Third-Party Property Damage: The Insurer will indemnify the Insured for legal liability arising from property damage caused to third-party properties up to a maximum limit of $1,000,000 per accident or series of accidents arising from one single event.

SECTION 3: EXCLUSIONS & CONDITIONS
3.1 Valid Commercial Driver License: No liability shall attach to the Insurer if the vehicle was being driven by any person other than a licensed commercial driver possessing a valid commercial driver's license (CDL) for the vehicle class.
3.2 Alcohol and Substance Influence: The Insurer shall not be liable for any loss, damage, or liability caused while the vehicle was being operated by any driver under the influence of intoxicating alcohol (blood alcohol concentration above 0.00%) or illicit narcotics.
3.3 Mechanical Breakdown & Wear: Wear and tear, mechanical or electrical breakdown, failure, breakage, depreciation, or tire damage caused by punctures, cuts, or bursts are strictly excluded unless caused in the same incident as covered collision damage.
3.4 Consequential Loss: Consequential losses, including loss of business use, commercial business interruption, or vehicle hire costs, are not covered under this fleet policy.
3.5 Territorial Limits: All vehicle operations must occur within continental territorial borders. Use outside designated commercial jurisdictions void coverage.

SECTION 4: DEDUCTIBLES & CLAIMS WORKFLOW
4.1 Compulsory Fleet Excess: A compulsory excess of $500 applies to each and every Own Damage claim.
4.2 Voluntary Excess: An optional voluntary excess of $250 reduces fleet annual premiums by 7.5%.
4.3 Police Notification (FIR): In the event of vehicle theft, fatal accident, or major third-party property damage exceeding $2,500, an official Police First Information Report (FIR) must be lodged within 24 hours.
4.4 Vehicle Inspection: The damaged vehicle must not be repaired without prior inspection by an authorized vehicle claims surveyor appointed by the Insurer.
`
  },
  {
    id: 'doc-life-2026',
    name: 'Apex Term Life & 36 Critical Illness Rider 2026.pdf',
    category: 'life',
    policyType: 'Term Life & Critical Illness',
    version: 'v5.0-2026',
    summary: 'Pure term death benefit protection coupled with accelerated terminal illness payouts and lump-sum coverage across 36 specified critical illnesses with 90-day waiting periods.',
    content: `
SECTION 1: BENEFIT SPECIFICATIONS
1.1 Death Benefit: Upon receipt and admission of satisfactory proof of the death of the Life Insured during the policy term, the Company shall pay the Sum Assured to the designated beneficiaries or legal heirs.
1.2 Accelerated Terminal Illness Benefit: If the Life Insured is diagnosed with a Terminal Illness (defined as an advanced medical condition expected to result in death within 12 months in the opinion of two independent medical specialists), the Company will accelerate and pay 50% of the Death Benefit in advance, up to $250,000.
1.3 36 Critical Illness Rider: Provides a lump-sum payment of 100% of the rider sum upon primary diagnosis of any of the 36 contractually enumerated critical illnesses, including Major Cancer, Acute Myocardial Infarction (Heart Attack), Coronary Artery Bypass Surgery, Stroke with Permanent Neurological Deficit, and End-Stage Kidney Failure.

SECTION 2: CRITICAL ILLNESS CONDITIONS & WAITING PERIODS
2.1 90-Day Initial Waiting Period: No Critical Illness Benefit shall be payable if the symptoms first manifested or the diagnosis occurred within 90 days from the policy inception date or reinstatement date.
2.2 30-Day Survival Period: Payment of the Critical Illness benefit is contingent upon the Life Insured surviving for a period of at least 30 consecutive days from the exact date of official diagnosis.
2.3 Premium Waiver on Disability: Following payment of an eligible Critical Illness benefit or total permanent disability, all future premiums for the core term life policy are completely waived for the remaining tenure.

SECTION 3: EXCLUSIONS & CLAUSE RESTRICTIONS
3.1 Suicide Exclusion: If the Life Insured commits suicide, whether sane or insane, within 12 months from the policy commencement date or reinstatement date, the Company will not pay the Death Benefit. The Company will refund 100% of premiums paid without interest.
3.2 Material Misrepresentation & Fraud: If any statement, medical disclosure, or personal declaration in the application proposal is found to be false, fraudulent, or materially misleading, this contract shall be void ab initio and all benefits forfeited.
3.3 War and Hazardous Pursuits: Death or critical illness resulting from active military deployment, aviation (other than as a fare-paying passenger on a licensed commercial airline), or participation in hazardous sports (mountaineering, base jumping) is excluded.
3.4 Premium Grace Period: A grace period of 30 days is allowed for payment of renewal premiums. If death occurs within the grace period, the overdue premium will be deducted from the death benefit.
`
  },
  {
    id: 'doc-property-2026',
    name: 'Commercial Property & Business Interruption Policy 2026.pdf',
    category: 'property',
    policyType: 'Commercial Property & BI',
    version: 'v2.4-2026',
    summary: 'All-risk physical asset protection for commercial premises, inventory, machinery, and business interruption gross profits coverage with a 12-month maximum indemnity period.',
    content: `
SECTION 1: PROPERTY DAMAGE INSURING AGREEMENT
1.1 Physical Property Coverage: Covers sudden, accidental physical loss or damage to insured commercial premises, buildings, office furniture, fixtures, stock-in-trade, and industrial machinery caused by Fire, Lightning, Explosion, Aircraft Impact, Riot, Storm, Cyclone, Flood, Water Pipe Burst, or Earthquake.
1.2 Replacement Cost Basis: Settlement of claims on buildings, plant, and machinery is calculated on the cost of replacing or reinstating damaged assets with new property of equal utility, without depreciation deductions, provided the sum insured equals 100% of full replacement value (Subject to 80% Co-Insurance Condition).

SECTION 2: BUSINESS INTERRUPTION (BI)
2.1 Loss of Gross Profit: Covers reduction in turnover and increase in cost of working resulting directly from an interruption or interference with commercial business activities caused by damage insured under Section 1.
2.2 Maximum Indemnity Period: The maximum period for which business interruption indemnity is payable is 12 consecutive months starting from the date of physical property damage.
2.3 Professional Accountants Fees: Reasonable charges payable to independent chartered accountants for producing certified business turnover and financial verification records are covered up to $20,000.

SECTION 3: EXCLUSIONS & SPECIAL PROVISIONS
3.1 Cyber Disruption Exclusion: Any direct or indirect physical loss, damage, or business interruption caused by cyber-attacks, ransomware, malicious code, denial of service attacks, or computer software corruption is excluded (Cyber Risk requires separate Endorsement CR-01).
3.2 Gradual Wear and Deterioration: Loss caused by normal atmospheric corrosion, rust, wet or dry rot, mold, vermin, shrinkage, evaporation, or latent defect is excluded.
3.3 Flood Deductible: A mandatory deductible of $5,000 applies to any single water inundation or flood damage occurrence.
`
  },
  {
    id: 'doc-travel-2026',
    name: 'Global Explorer Travel Medical Policy 2026.pdf',
    category: 'travel',
    policyType: 'International Travel & Medical',
    version: 'v4.0-2026',
    summary: 'International travel protection covering worldwide medical evacuation, emergency overseas hospitalization, luggage loss, and trip cancellation protocols.',
    content: `
SECTION 1: OVERSEAS MEDICAL EXPENSES & EVACUATION
1.1 Emergency Hospitalization Abroad: Pays necessary medical and surgical treatment expenses incurred outside the Insured's home country due to unexpected sudden illness or accidental injury up to $1,000,000.
1.2 Emergency Medical Evacuation: In medical emergencies where local medical facilities cannot provide adequate care, the Assistance Service will arrange and pay for emergency evacuation to the nearest competent medical facility or repatriation to home country up to $500,000.
1.3 Repatriation of Mortal Remains: Pays expenses of preparing and transporting the mortal remains of the Insured back to their country of residence up to $50,000.

SECTION 2: TRIP CANCELLATION & DELAY
2.1 Trip Cancellation: Reimburses non-refundable unused prepaid accommodation and flight expenses up to $10,000 if the trip is canceled due to accidental bodily injury, severe acute illness, or death of the Insured or an immediate family member prior to scheduled departure.
2.2 Baggage Loss: Indemnifies the Insured for total accidental loss of checked-in baggage in the custody of a common commercial carrier up to $2,500 ($500 single item sub-limit).

SECTION 3: TRAVEL EXCLUSIONS
3.1 Unstable Pre-Existing Chronic Conditions: Any medical complication arising from a chronic condition that required medical treatment, hospitalization, or dosage adjustments within 90 days prior to trip departure is excluded.
3.2 High-Altitude Mountaineering: Ascents or treks exceeding 4,000 meters above sea level are excluded unless a High-Altitude Mountaineering Rider is purchased.
3.3 Sanctioned & Conflict Zones: Any incident occurring in countries or regions under active international sanctions or classified as Level 4 ("Do Not Travel") by official government advisories is strictly excluded.
`
  }
];
