# AI Prompt Engineering Templates for Insurance Operations

## Overview
This document provides comprehensive AI prompt templates designed for insurance operations, covering underwriting, claims processing, customer service, and regulatory compliance. Each template is optimized for consistent, accurate, and compliant insurance operations.

## Template Categories

### 1. Underwriting AI Prompts
### 2. Claims Processing AI Prompts  
### 3. Customer Service AI Prompts
### 4. Compliance and Regulatory AI Prompts
### 5. Bond Insurance Specialized Prompts
### 6. Risk Assessment AI Prompts

---

## 1. Underwriting AI Prompts

### Risk Assessment Prompt Template

```
# Insurance Risk Assessment Analysis

## Context
You are an expert insurance underwriter analyzing a new application for coverage. Provide a comprehensive risk assessment based on the provided information.

## Input Data
**Coverage Type**: {coverage_type}
**Policy Limits**: {policy_limits}  
**Deductible**: {deductible}
**Applicant Profile**: {applicant_data}
**Property/Asset Details**: {property_details}
**Claims History**: {claims_history}
**Geographic Location**: {location_data}
**Additional Risk Factors**: {additional_factors}

## Analysis Requirements

Evaluate the following risk categories (scale 1-10, where 10 is highest risk):

1. **Primary Risk Assessment**
   - Overall risk score with justification
   - Key risk drivers and their impact
   - Risk mitigation opportunities

2. **Historical Loss Potential**
   - Similar risk loss experience
   - Industry benchmark comparison
   - Trend analysis and projections

3. **Geographic and Environmental Factors**
   - Location-specific risks (natural disasters, crime, economic factors)
   - Regulatory environment impact
   - Market-specific considerations

4. **Financial and Credit Analysis**
   - Financial stability assessment
   - Credit worthiness evaluation
   - Payment capability analysis

5. **Special Risk Factors**
   - Unique or unusual risk elements
   - Emerging risk considerations
   - Technology or industry-specific risks

## Output Format

Provide structured analysis with:
- **Risk Score**: Numerical rating (1-10) with confidence level (%)
- **Premium Recommendation**: Suggested base premium with adjustments
- **Policy Conditions**: Recommended terms, conditions, and exclusions
- **Underwriting Decision**: Accept/Modify/Decline with reasoning
- **Follow-up Actions**: Additional information needed or monitoring requirements

## Compliance Notes
Ensure all recommendations comply with:
- State insurance regulations
- Fair lending practices
- Anti-discrimination laws
- Company underwriting guidelines
```

### Premium Calculation Prompt Template

```
# Premium Calculation Engine

## Task
Calculate accurate insurance premium based on risk assessment and company pricing guidelines.

## Input Parameters
**Base Coverage Details**:
- Coverage Type: {coverage_type}
- Policy Limits: {limits}
- Deductible Amount: {deductible}
- Coverage Term: {term}

**Risk Profile Data**:
- Risk Assessment Score: {risk_score}
- Geographic Zone: {territory}
- Industry Classification: {industry_code}
- Claims History Factor: {claims_modifier}
- Credit Score Impact: {credit_factor}

**Market Factors**:
- Current Rate Environment: {market_conditions}
- Competitive Position: {competitive_factor}
- Regulatory Rate Constraints: {rate_limits}

## Calculation Process

Apply the following pricing components in sequence:

1. **Base Premium Calculation**
   - Coverage amount × base rate per $1000 of coverage
   - Deductible credit application
   - Policy minimum premium check

2. **Risk Adjustment Factors**
   - Territory multiplier: {territory_factor}
   - Industry risk multiplier: {industry_factor}
   - Individual risk score adjustment: {risk_adjustment}

3. **Experience Modifications**
   - Claims history modifier: {claims_mod}
   - Credit score impact: {credit_mod}
   - Loss prevention credit: {prevention_credit}

4. **Market and Competitive Adjustments**
   - Market competitiveness factor: {market_adj}
   - New business discount: {new_business_discount}
   - Multi-policy discount: {multi_policy_discount}

5. **Regulatory and Tax Additions**
   - State-required surcharges: {surcharges}
   - Premium tax: {premium_tax}
   - Policy fees: {fees}

## Output Requirements

Provide detailed breakdown:
- **Base Premium**: ${base_amount}
- **Risk Adjustments**: ${risk_adjustments} (itemized)
- **Experience Modifications**: ${experience_mods} (itemized)
- **Market Adjustments**: ${market_adjustments} (itemized)
- **Taxes and Fees**: ${taxes_fees} (itemized)
- **Total Premium**: ${total_premium}
- **Effective Rate per $1000**: ${effective_rate}

Include justification for each major adjustment and confidence level in final premium.
```

---

## 2. Claims Processing AI Prompts

### Coverage Determination Prompt

```
# Insurance Coverage Analysis

## Objective
Determine coverage applicability and calculate potential settlement amount for submitted claim.

## Claim Information
**Claim Details**:
- Claim Number: {claim_number}
- Loss Date: {loss_date}
- Loss Time: {loss_time}
- Location of Loss: {loss_location}
- Cause of Loss: {cause_description}
- Estimated Loss Amount: {estimated_loss}

**Policy Information**:
- Policy Number: {policy_number}
- Policy Effective Date: {effective_date}
- Policy Expiration Date: {expiration_date}
- Coverage Limits: {coverage_limits}
- Deductible: {deductible}
- Policy Language: {policy_provisions}

**Investigation Findings**:
- Adjuster Report: {adjuster_findings}
- Expert Opinions: {expert_reports}
- Documentation: {supporting_docs}
- Photos/Evidence: {evidence_summary}

## Coverage Analysis Framework

### 1. Coverage Trigger Analysis
Evaluate if the loss satisfies policy trigger requirements:
- **Occurrence Definition**: Does the loss meet policy definition of covered occurrence?
- **Timing Requirements**: Did loss occur during policy period?
- **Location Coverage**: Is loss location covered under policy terms?
- **Cause of Loss**: Is the cause of loss covered (not excluded)?

### 2. Exclusion Analysis  
Review all potentially applicable exclusions:
- **General Exclusions**: Standard policy exclusions
- **Specific Exclusions**: Coverage-specific exclusions
- **Endorsement Exclusions**: Additional exclusions via endorsement
- **Regulatory Exclusions**: State-mandated exclusions

### 3. Policy Limit Analysis
Determine applicable coverage limits:
- **Per-Occurrence Limits**: Maximum per claim
- **Aggregate Limits**: Annual/policy period maximums  
- **Sub-limits**: Specific coverage category limits
- **Shared Limits**: Multiple coverage interactions

### 4. Deductible Application
Calculate deductible impact:
- **Deductible Type**: Per occurrence, annual aggregate, percentage
- **Deductible Amount**: Specific dollar amount or calculation
- **Deductible Credits**: Any applicable reductions
- **Multiple Deductibles**: Interaction of multiple deductible provisions

## Output Requirements

### Coverage Determination
- **Coverage Status**: Covered/Not Covered/Partial Coverage
- **Coverage Reasoning**: Detailed explanation with policy citations
- **Exclusion Analysis**: All considered exclusions and why they do/don't apply
- **Legal Precedents**: Relevant case law or regulatory guidance

### Settlement Calculation
- **Gross Loss Amount**: Total claimed damages
- **Covered Loss Amount**: Amount subject to policy coverage
- **Policy Limit Application**: Limit reductions if applicable
- **Deductible Reduction**: Deductible amount and application
- **Net Settlement Amount**: Final payable amount

### Supporting Documentation
- **Policy Provisions**: Specific language supporting determination
- **Investigation Summary**: Key findings supporting coverage decision
- **Precedent Cases**: Similar claims and their resolution
- **Regulatory Compliance**: Applicable state requirements

## Quality Assurance Checklist
- [ ] All policy provisions reviewed and cited
- [ ] All exclusions considered and documented
- [ ] Settlement calculation verified and explained
- [ ] Legal compliance confirmed
- [ ] Clear reasoning provided for coverage determination
```

### Claims Investigation Prompt

```
# Claims Investigation Protocol

## Investigation Objective
Conduct thorough investigation to verify claim legitimacy and determine appropriate settlement.

## Case Information
**Basic Claim Data**:
- Claim ID: {claim_id}
- Claimant: {claimant_name}
- Policy Number: {policy_number}  
- Date of Loss: {loss_date}
- Reported Date: {report_date}
- Loss Description: {loss_summary}

**Initial Red Flags** (if any):
- Late reporting: {late_report_details}
- Prior claims: {claims_history}
- Coverage changes: {recent_changes}
- Suspicious circumstances: {red_flags}

## Investigation Framework

### 1. Document Collection and Review
**Required Documentation**:
- [ ] Police report (if applicable)
- [ ] Medical records (for injury claims)
- [ ] Repair estimates and invoices
- [ ] Financial records (if relevant)
- [ ] Photographs of damage/scene
- [ ] Witness statements
- [ ] Expert reports

**Document Analysis**:
- Consistency across all documents
- Timeline verification
- Signature authenticity
- Document date correlation

### 2. Interview Protocol

**Claimant Interview Questions**:
- Detailed loss circumstances
- Timeline of events
- Knowledge of policy coverage
- Financial situation assessment
- Prior claim experience

**Witness Interview Framework**:
- Independent witness identification
- Corroboration of claimant statements
- Contradictory information identification
- Witness credibility assessment

### 3. Physical Investigation

**Scene Investigation**:
- Loss location examination
- Damage pattern analysis
- Cause determination verification
- Evidence preservation

**Property Investigation**:
- Ownership verification
- Value assessment
- Pre-loss condition determination
- Maintenance and care evaluation

### 4. Fraud Detection Analysis

**Fraud Indicators Checklist**:
- [ ] Excessive or rushed claims
- [ ] Unusual loss circumstances
- [ ] Inconsistent statements
- [ ] Financial motivation
- [ ] Prior fraud history
- [ ] Staged loss indicators

**Investigation Actions**:
- Background check requirements
- Financial investigation scope
- Social media investigation
- Surveillance considerations

## Analysis and Findings

### Investigation Summary
Provide comprehensive summary addressing:

1. **Loss Verification**
   - Confirmed loss occurrence: Yes/No
   - Loss cause verification: Confirmed/Disputed/Unclear
   - Timeline accuracy: Verified/Discrepancies noted
   - Damage extent confirmation: Accurate/Overstated/Understated

2. **Coverage Analysis**
   - Policy coverage confirmation
   - Exclusion applicability
   - Limit and deductible verification
   - Special conditions compliance

3. **Fraud Assessment**
   - Fraud probability: High/Medium/Low/None
   - Specific fraud indicators identified
   - Recommended further investigation
   - SIU referral recommendation

4. **Settlement Recommendation**
   - Recommended settlement amount
   - Settlement justification
   - Payment timing recommendation
   - Special conditions for payment

### Documentation Requirements

**Investigation Report Sections**:
- Executive Summary
- Investigation methodology
- Findings and analysis
- Recommendations and next steps
- Supporting documentation index

**Quality Assurance**:
- [ ] All investigation steps completed
- [ ] Documentation properly indexed
- [ ] Legal compliance verified
- [ ] Supervisor review completed
- [ ] File ready for settlement decision
```

---

## 3. Customer Service AI Prompts

### Policy Explanation Prompt

```
# Customer Policy Explanation Assistant

## Objective
Explain complex insurance policy provisions in clear, customer-friendly language while maintaining accuracy and compliance.

## Context Information
**Customer Profile**:
- Customer Name: {customer_name}
- Policy Type: {policy_type}
- Policy Number: {policy_number}
- Customer Experience Level: {experience_level}
- Preferred Communication Style: {communication_preference}

**Inquiry Details**:
- Customer Question: {customer_question}
- Specific Policy Section: {policy_section}
- Reason for Inquiry: {inquiry_reason}
- Urgency Level: {urgency}

**Policy Language** (Complex):
{complex_policy_language}

## Explanation Framework

### 1. Plain Language Translation
Convert complex policy language to customer-friendly terms:
- Remove insurance jargon
- Use everyday examples
- Explain purpose behind provisions
- Highlight customer benefits

### 2. Relevant Examples
Provide specific scenarios that illustrate coverage:
- Common claim examples
- Exclusion scenarios
- Deductible applications
- Limit interactions

### 3. Customer Impact Analysis
Explain how provisions affect the customer:
- Financial implications
- Coverage gaps or limitations
- Required customer actions
- Available options or alternatives

## Response Template

### Opening
"Thank you for your question about [specific topic]. I'll explain this in simple terms and provide examples to help you understand how this affects your coverage."

### Main Explanation
**What This Means**: [Plain language explanation]

**Real-World Example**: [Relevant scenario]

**How This Affects You**: [Customer-specific impact]

**Important Limitations**: [Key restrictions or exclusions]

### Additional Information

**Related Coverage**: [Connected policy provisions]

**Your Options**: [Available choices or alternatives]  

**Next Steps**: [Recommended actions]

**Additional Resources**: [Where to get more information]

### Closing
"Does this explanation help clarify your coverage? Do you have any other questions about this or other parts of your policy?"

## Communication Guidelines

### Language Standards
- Use 8th-grade reading level
- Avoid industry jargon
- Define necessary technical terms
- Use active voice and short sentences

### Tone Requirements
- Professional but friendly
- Empathetic to customer concerns
- Confident in explanations
- Patient with follow-up questions

### Compliance Requirements
- Maintain policy accuracy
- Include required disclosures
- Avoid providing legal advice
- Document interaction appropriately

## Quality Checks
- [ ] Explanation is accurate to policy terms
- [ ] Language is customer-appropriate
- [ ] Examples are relevant and helpful
- [ ] All customer questions addressed
- [ ] Compliance requirements met
- [ ] Follow-up actions identified
```

### Claims Status Communication Prompt

```
# Claims Status Communication Template

## Communication Objective
Provide clear, empathetic, and informative updates on claim status while managing customer expectations.

## Claim Information
**Claim Details**:
- Claim Number: {claim_number}
- Loss Date: {loss_date}
- Claim Type: {claim_type}
- Current Status: {current_status}
- Days Since Reported: {days_since_report}

**Customer Context**:
- Customer Name: {customer_name}
- Communication History: {prior_communications}
- Stress Level/Concerns: {customer_concerns}
- Preferred Updates: {update_preference}

**Status Categories**:
- Under Investigation
- Pending Documentation  
- Coverage Review
- Settlement Pending
- Payment Processing
- Claim Closed

## Status Update Templates

### Investigation Phase
"Your claim is currently under investigation. Here's what's happening:

**Current Activity**: [Specific investigation steps being taken]
- Adjuster assignment: [Adjuster name and contact]
- Documentation review: [Status of document collection]
- Investigation timeline: [Expected completion date]

**What We Need From You**: [Any pending requirements]

**Next Steps**: [Upcoming investigation activities]

**Estimated Timeline**: [Realistic timeframe for next update]"

### Documentation Phase  
"We're reviewing the documentation for your claim:

**Documents Received**: [List of received items]
- [Document 1] ✓
- [Document 2] ✓  
- [Document 3] ⏳ Pending

**Outstanding Items**: [What's still needed]
- [Missing document]: Needed by [date]
- [Additional information]: Details required

**How to Submit**: [Submission instructions]

**Impact on Processing**: [How delays affect claim resolution]"

### Coverage Review Phase
"We're conducting a detailed review of your policy coverage:

**Coverage Analysis**: We're reviewing your policy to determine what's covered under your specific terms and conditions.

**Timeline**: This review typically takes [timeframe] and involves:
- Policy provision analysis
- Legal consultation (if needed)
- Precedent case review

**No Action Required**: You don't need to do anything during this phase.

**Next Update**: We'll contact you by [date] with our coverage determination."

### Settlement Phase
"Good news! We've determined coverage for your claim:

**Coverage Decision**: [Covered/Partially Covered] for [amount]

**Settlement Breakdown**:
- Total Loss Amount: ${total_loss}
- Covered Amount: ${covered_amount}
- Deductible: ${deductible}
- Net Settlement: ${net_settlement}

**Payment Processing**: 
- Settlement documents: [Status]
- Payment method: [Check/Direct Deposit]
- Expected payment date: [Date]

**Questions**: Please contact us if you have questions about the settlement calculation."

## Empathetic Communication Framework

### Acknowledging Customer Impact
"I understand this has been a difficult time for you, and I want to make sure you're informed throughout our process."

### Setting Realistic Expectations
"While we work as quickly as possible, thorough investigation is important to ensure fair handling of your claim. Here's what you can expect..."

### Providing Control and Options
"Here's how you can track your claim status and what you can do to help expedite the process..."

### Addressing Common Concerns

**Concern: Taking Too Long**
"I understand your frustration with the timeline. The investigation process is designed to ensure fair and accurate claim resolution. Here's specifically what's happening and why it's necessary..."

**Concern: Lack of Communication**
"You're right to expect regular updates. I'll make sure you receive updates every [frequency] until your claim is resolved."

**Concern: Coverage Denial**
"I know this isn't the outcome you hoped for. Let me explain the specific policy provisions that led to this decision and your options for appeal or review..."

## Follow-up Protocol

### Proactive Communication Schedule
- Initial acknowledgment: Within 24 hours
- Investigation updates: Every 7 days
- Coverage decision: Within 2 days of determination
- Settlement communication: Same day as authorization
- Payment confirmation: Day of payment processing

### Customer Satisfaction Check
"Before we close this conversation, is there anything else I can help clarify about your claim or our process?"

### Documentation Requirements
- Record all customer interactions
- Note customer concerns and responses
- Track communication preferences
- Update claim notes with customer feedback
```

---

## 4. Compliance and Regulatory AI Prompts

### Regulatory Compliance Check Prompt

```
# Insurance Regulatory Compliance Verification

## Compliance Review Objective
Ensure all insurance documents, processes, and communications comply with applicable state and federal regulations.

## Review Parameters
**Jurisdiction**: {state/federal}
**Document Type**: {document_category}
**Effective Date**: {compliance_date}
**Review Content**: {content_to_review}

**Applicable Regulations**:
- State Insurance Code: {state_code_sections}
- Federal Requirements: {federal_regulations}
- Industry Standards: {industry_requirements}
- Company Guidelines: {internal_policies}

## Compliance Framework

### 1. Required Disclosure Analysis

**Mandatory Disclosures Checklist**:
- [ ] Right to cancel provisions
- [ ] Premium payment terms
- [ ] Coverage limitations and exclusions
- [ ] Complaint procedures
- [ ] Regulatory contact information
- [ ] Privacy notices
- [ ] Anti-fraud warnings

**State-Specific Requirements**:
- [ ] {State} specific disclosure language
- [ ] Required font sizes and formatting
- [ ] Language translation requirements
- [ ] Special population considerations

### 2. Form and Rate Compliance

**Form Approval Verification**:
- [ ] State-approved policy forms used
- [ ] Current form version confirmed
- [ ] Required endorsements attached
- [ ] Proper form filing references

**Rate Compliance Check**:
- [ ] State-filed rates applied correctly
- [ ] No unfiled rate deviations
- [ ] Proper rate classification usage
- [ ] Anti-discrimination compliance

### 3. Marketing and Advertising Compliance

**Advertising Standards**:
- [ ] No false or misleading statements
- [ ] Required disclaimers included
- [ ] Proper company licensing display
- [ ] Fair comparison standards met

**Sales Practice Compliance**:
- [ ] Agent licensing verification
- [ ] Proper authority representations
- [ ] Required sales disclosures
- [ ] Documentation requirements met

## Specific Compliance Areas

### Policy Language Compliance

**Standard Policy Provisions**:
```
Review for required standard provisions:
- Entire contract clause
- Time limit on certain defenses
- Grace period provisions
- Reinstatement clause
- Notice of claim requirements
- Claim forms and proof of loss
- Payment of claims provisions
```

**Readability Requirements**:
- Flesch Reading Ease Score: {required_score}
- Average sentence length: {max_words}
- Passive voice usage: {max_percentage}
- Technical term definitions included

### Consumer Protection Compliance

**Fair Dealing Requirements**:
- [ ] No unconscionable contract terms
- [ ] Clear coverage explanations
- [ ] Reasonable premium collection practices
- [ ] Fair claims handling procedures

**Privacy Compliance**:
- [ ] GLBA privacy notice requirements
- [ ] Data collection disclosures
- [ ] Third-party sharing notifications
- [ ] Customer opt-out procedures

### Claims Handling Compliance

**Unfair Claims Practices Prevention**:
- [ ] Prompt investigation requirements
- [ ] Fair settlement standards
- [ ] Proper documentation maintenance
- [ ] Required claims notifications

**Time Limit Compliance**:
- [ ] Acknowledgment timeframes: {state_requirement}
- [ ] Investigation completion: {max_days}
- [ ] Settlement processing: {payment_days}
- [ ] Communication requirements: {update_frequency}

## Output Format

### Compliance Status Report

**Overall Compliance**: ✅ Compliant / ⚠️ Minor Issues / ❌ Major Violations

**Detailed Findings**:

1. **Required Disclosures**
   - Status: {compliant/non-compliant}
   - Issues found: {specific_violations}
   - Corrective actions: {required_fixes}

2. **Form and Rate Compliance**
   - Status: {compliant/non-compliant}  
   - Issues found: {specific_violations}
   - Corrective actions: {required_fixes}

3. **Consumer Protection**
   - Status: {compliant/non-compliant}
   - Issues found: {specific_violations}
   - Corrective actions: {required_fixes}

### Priority Action Items
1. **Immediate Actions Required** (Regulatory violations)
2. **Short-term Corrections** (Minor compliance gaps)
3. **Process Improvements** (Best practice enhancements)

### Documentation Requirements
- Compliance review date and reviewer
- Specific regulations referenced
- Evidence of compliance or violations
- Corrective action timeline
- Follow-up review schedule

## Quality Assurance
- [ ] All applicable regulations reviewed
- [ ] Current regulation versions confirmed
- [ ] Cross-jurisdictional conflicts identified
- [ ] Legal counsel consultation recommended (if needed)
- [ ] Implementation timeline feasible
```

---

## 5. Bond Insurance Specialized Prompts

### Municipal Credit Analysis Prompt

```
# Municipal Bond Insurance Credit Analysis

## Analysis Objective
Conduct comprehensive credit analysis for municipal bond insurance application, evaluating default probability and appropriate insurance terms.

## Municipal Entity Information
**Basic Information**:
- Municipality: {entity_name}
- State: {state}
- Population: {population}
- Municipal Type: {entity_type} (City/County/District/Authority)
- Bond Purpose: {bond_purpose}
- Bond Amount: ${bond_amount}
- Bond Term: {maturity_years} years

**Financial Data**:
- Annual Operating Budget: ${operating_budget}
- Total Outstanding Debt: ${total_debt}
- Debt Service Coverage: {coverage_ratio}
- General Fund Balance: ${fund_balance}
- Credit Rating: {current_rating}

## Credit Analysis Framework

### 1. Economic Base Assessment

**Economic Diversity Analysis**:
- Major employers and employment stability
- Industry concentration risks
- Population trends (growth/decline)
- Income levels and trends
- Property value trends

**Economic Indicators**:
- Unemployment rate vs. state/national: {unemployment_comparison}
- Median household income vs. state: {income_comparison}  
- Property tax base growth: {tax_base_trend}
- Commercial/industrial diversity: {diversity_score}

### 2. Financial Performance Analysis

**Revenue Analysis**:
- Revenue stability and predictability
- Dependence on volatile revenue sources
- Tax collection rates and trends
- Intergovernmental revenue dependence
- Revenue diversification assessment

**Financial Ratios** (Calculate and interpret):
- Debt per capita: ${debt_per_capita}
- Debt to assessed value: {debt_to_av}%
- Debt service to operating revenue: {ds_to_revenue}%
- Operating margin trend: {operating_margin}%
- Fund balance to revenue: {fb_to_revenue}%

### 3. Debt Structure Analysis

**Existing Debt Profile**:
- Total bonded debt outstanding
- Debt maturity distribution
- Variable vs. fixed rate exposure
- Self-supporting vs. general obligation split
- Overlapping debt analysis

**New Debt Impact**:
- Pro-forma debt ratios
- Debt service coverage impact
- Peak debt service analysis
- Refinancing risk assessment

### 4. Management and Governance

**Management Quality Assessment**:
- Financial management practices
- Budget forecasting accuracy
- Audit findings and management responses
- Internal control environment
- Strategic planning capability

**Political Environment**:
- Political stability and leadership
- Community support for fiscal policies
- History of financial decision-making
- Labor relations environment

### 5. Legal and Regulatory Environment

**Legal Structure Analysis**:
- Municipal legal authority
- Debt issuance authorization
- Security provisions and pledged revenues
- Rate covenant compliance capability

**Regulatory Constraints**:
- State oversight requirements
- Debt limitation laws
- Tax rate limitations
- Special district regulations (if applicable)

## Risk Assessment

### Credit Strengths
Identify positive credit factors:
- [ ] Diverse economic base
- [ ] Strong financial management
- [ ] Stable revenue sources
- [ ] Conservative debt management
- [ ] Adequate reserves
- [ ] Political stability

### Credit Concerns
Identify negative credit factors:
- [ ] Economic concentration risks
- [ ] Revenue volatility
- [ ] High debt burden
- [ ] Weak management practices
- [ ] Political instability
- [ ] Legal constraints

### Stress Testing Scenarios

**Economic Stress**:
- 10% revenue decline impact
- Major employer departure
- Property value decline scenarios

**Interest Rate Stress**:
- Variable rate debt exposure
- Refinancing risk assessment
- Market access concerns

## Insurance Decision Framework

### Risk Rating Matrix
**Overall Credit Quality**: AAA/AA/A/BBB/BB/B/Below Investment Grade

**Default Probability Assessment**:
- 1-year: {1yr_default_prob}%
- 5-year: {5yr_default_prob}%  
- 10-year: {10yr_default_prob}%
- Life-of-bond: {cumulative_default_prob}%

### Insurance Terms Recommendation

**Coverage Decision**: Accept/Accept with Conditions/Decline

**Recommended Terms** (if acceptable):
- Insurance premium rate: {premium_rate} basis points
- Policy conditions and covenants
- Monitoring requirements
- Reserve requirements

**Risk Mitigation Requirements**:
- Financial reporting frequency
- Ratio maintenance covenants
- Additional security requirements
- Event-driven monitoring triggers

### Monitoring Plan

**Ongoing Surveillance**:
- Financial statement review frequency
- Key ratio monitoring
- Economic indicator tracking
- Rating agency surveillance coordination

**Early Warning Triggers**:
- Debt service coverage below {trigger_ratio}
- Fund balance below {trigger_percentage}% of revenues
- Rating downgrade below {rating_floor}
- Economic stress indicators

## Output Summary

**Executive Summary**:
- Credit recommendation with rationale
- Key risk factors and mitigants
- Recommended insurance terms
- Ongoing monitoring plan

**Credit Committee Presentation**:
- Structured presentation of analysis
- Peer comparison analysis
- Sensitivity analysis results
- Risk-adjusted return calculations

**Documentation Requirements**:
- Complete analysis file
- Third-party reports and validations
- Legal opinion requirements
- Compliance verification checklist
```

---

## 6. Risk Assessment AI Prompts

### Comprehensive Risk Analysis Prompt

```
# Integrated Risk Assessment Framework

## Assessment Objective
Conduct multi-dimensional risk analysis incorporating traditional insurance risks, emerging risks, and systemic risk factors.

## Risk Categories for Analysis

### 1. Traditional Insurance Risks
**Property Risks**:
- Physical asset exposure
- Natural catastrophe vulnerability  
- Fire, theft, vandalism exposure
- Business interruption potential

**Liability Risks**:
- Third-party injury/damage exposure
- Professional liability concerns
- Product liability considerations
- Cyber liability exposure

**Financial Risks**:
- Credit risk exposure
- Market risk factors
- Liquidity risk concerns
- Operational risk elements

### 2. Emerging Risk Factors
**Technology Risks**:
- Cybersecurity vulnerabilities
- Data privacy exposures
- AI/automation impacts
- Digital transformation risks

**Environmental Risks**:
- Climate change impacts
- Regulatory environmental changes
- ESG compliance requirements
- Resource scarcity issues

**Social and Political Risks**:
- Demographic shifts
- Regulatory changes
- Political instability
- Social unrest impacts

### 3. Systemic Risk Considerations
**Economic Risks**:
- Economic cycle impacts
- Interest rate sensitivity
- Inflation exposure
- Currency risks (if applicable)

**Market Structure Risks**:
- Industry concentration
- Supply chain vulnerabilities
- Market disruption potential
- Competitive environment changes

## Risk Evaluation Matrix

For each identified risk, evaluate:

**Probability Assessment** (1-10 scale):
- Historical frequency data
- Current trend analysis
- Expert opinion integration
- Scenario probability modeling

**Impact Severity** (1-10 scale):
- Financial impact quantification
- Operational disruption assessment
- Reputational damage potential
- Strategic impact evaluation

**Risk Velocity** (Speed of impact):
- Immediate (< 1 month)
- Short-term (1-12 months)
- Medium-term (1-5 years)
- Long-term (> 5 years)

**Detection Difficulty** (Early warning capability):
- Easy to detect with current systems
- Moderate detection capability
- Difficult to detect early
- Nearly impossible to predict

## Risk Quantification

### Financial Impact Modeling
**Expected Loss Calculation**:
- Frequency × Severity = Expected Annual Loss
- 95th percentile loss estimate
- 99th percentile loss estimate
- Maximum probable loss

**Risk-Adjusted Metrics**:
- Value at Risk (VaR) calculations
- Expected Shortfall analysis
- Return on Risk-Adjusted Capital
- Economic capital allocation

### Correlation Analysis
**Risk Interdependencies**:
- Correlation between risk types
- Cascading risk scenarios
- Risk concentration analysis
- Portfolio effect considerations

## Risk Treatment Framework

### Risk Mitigation Strategies
**Prevention**:
- Loss control measures
- Safety programs implementation
- Security enhancements
- Training and education

**Reduction**:
- Process improvements
- Technology upgrades
- Diversification strategies
- Contingency planning

### Risk Transfer Options
**Insurance Solutions**:
- Traditional insurance coverage
- Alternative risk transfer
- Captive insurance considerations
- Self-insurance evaluation

**Financial Instruments**:
- Derivatives for hedge strategies
- Contingent capital arrangements
- Catastrophe bonds
- Risk-linked securities

### Risk Acceptance Decisions
**Retained Risk Analysis**:
- Cost-benefit analysis of retention
- Self-insurance fund requirements
- Risk tolerance assessment
- Regulatory capital implications

## Monitoring and Review Protocol

### Key Risk Indicators (KRIs)
Define measurable indicators for each major risk:
- Leading indicators (predictive)
- Lagging indicators (confirmatory)  
- Threshold levels for action
- Reporting frequency requirements

### Risk Dashboard Development
**Executive Summary Metrics**:
- Overall risk score trending
- Top 10 risk concerns
- Risk appetite utilization
- Risk-adjusted performance metrics

### Stress Testing Framework
**Scenario Development**:
- Best case scenario analysis
- Expected case projections
- Stress case evaluations
- Extreme scenario modeling

**Sensitivity Analysis**:
- Single factor stress tests
- Multi-factor scenario analysis
- Reverse stress testing
- Scenario probability assessment

## Output Deliverables

### Risk Assessment Report
**Executive Summary**:
- Overall risk profile rating
- Key risk drivers identification
- Critical action items
- Risk appetite alignment assessment

**Detailed Risk Analysis**:
- Individual risk factor evaluation
- Risk correlation analysis
- Quantitative impact modeling
- Treatment strategy recommendations

### Risk Management Plan
**Immediate Actions**:
- High-priority risk treatments
- Resource allocation requirements
- Implementation timelines
- Success metrics definition

**Long-term Strategy**:
- Strategic risk management direction
- Investment requirements
- Organizational capability needs
- Performance monitoring framework

### Regulatory and Compliance Reporting
**Required Risk Disclosures**:
- Regulatory reporting compliance
- Stakeholder communication requirements
- Board reporting obligations
- Public disclosure considerations

## Quality Assurance Framework
- [ ] All material risks identified and assessed
- [ ] Quantification methodologies validated
- [ ] Treatment strategies cost-effective
- [ ] Monitoring systems adequate
- [ ] Reporting requirements met
- [ ] Regulatory compliance confirmed
```

---

## Implementation Guidelines

### Prompt Customization Process

1. **Context Adaptation**: Modify templates based on specific use cases
2. **Data Integration**: Ensure prompts align with available data sources
3. **Regulatory Alignment**: Customize for specific jurisdictional requirements
4. **Quality Control**: Implement review processes for AI-generated outputs
5. **Continuous Improvement**: Regular template updates based on performance

### Best Practices for AI Prompt Usage

1. **Prompt Engineering**:
   - Use specific, detailed instructions
   - Provide relevant context and examples
   - Define expected output formats
   - Include quality control checkpoints

2. **Human Oversight**:
   - Always review AI-generated content
   - Verify accuracy against source documents
   - Ensure regulatory compliance
   - Apply professional judgment

3. **Documentation and Audit Trail**:
   - Record prompt versions and modifications
   - Document review and approval processes
   - Maintain training data and model versions
   - Track performance metrics and improvements

### Integration with Insurance Systems

1. **Data Pipeline Integration**: Connect prompts with real-time insurance data
2. **Workflow Automation**: Embed prompts in existing business processes
3. **Quality Assurance**: Implement automated validation and human review
4. **Performance Monitoring**: Track accuracy, efficiency, and user satisfaction

---

*These AI prompt templates provide a comprehensive foundation for automating and standardizing insurance operations while maintaining accuracy, compliance, and quality control throughout all insurance processes.*