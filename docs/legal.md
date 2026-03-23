# Legal & compliance pack for NutriTiffin + Razorpay

**Purpose:** Single compilation of policy text, disclosures, and checklists for Razorpay onboarding and for publishing on your website/app. **This is not legal advice.** Have a qualified lawyer in India review and adapt names, addresses, timelines, and refund logic to match how you actually operate.

**How to use**

- Replace remaining `[BRACKETS]` placeholders (e.g. date, phone, business hours) before going live.
- Split sections 1–6 into separate pages on your site (`/terms`, `/privacy`, `/refunds`, `/delivery`, `/contact`) and link them from the footer **and** from checkout.
- Keep checkout pricing consistent with your backend: item totals, **platform fees**, **delivery fees**, **kitchen fees**, and **taxes** (your `Order` model stores these explicitly).

**Operator status (as stated by you):** NutriTiffin is run as a **community-based service**, not as a registered company at present. If the service grows, you may incorporate and register (e.g. GST) later. Razorpay and other partners may still require **identity and bank KYC** for the account holder even when the “business” is informal—confirm current Razorpay rules for individuals/community projects.

---

## Document index (what Razorpay and users expect)

| # | Document | Typical URL |
|---|----------|-------------|
| 1 | Terms & Conditions | `/terms` or `/terms-and-conditions` |
| 2 | Privacy Policy | `/privacy` |
| 3 | Refund & Cancellation Policy | `/refunds` or `/cancellation-and-refunds` |
| 4 | Shipping / Delivery Policy | `/delivery` or `/shipping` |
| 5 | Contact Us | `/contact` |

---

## 1. Terms & Conditions

**NutriTiffin** — Terms of use  
**Last updated:** [DATE]  
**Operator:** NutriTiffin, a **community-based** food-ordering and delivery facilitation service operated from **Puducherry (Pondicherry), 605001**, India (“**we**”, “**us**”, “**NutriTiffin**”). We are **not** a registered company or partnership as of the date above; if we formalize a legal entity later, we will update these Terms and the Contact section.

### 1.1 Service description

NutriTiffin operates a technology platform that connects customers (“**users**”, “**you**”) with independent home kitchens / food partners (“**kitchens**”, “**vendors**”) for ordering scheduled, home-style meals. We provide software, ordering, payment facilitation, and related support. Unless stated otherwise, **kitchens are independent**; meal preparation and compliance with food laws are primarily the kitchen’s responsibility.

### 1.2 Eligibility

You must be capable of entering into a binding contract under applicable law. If you use the service on behalf of a business, you represent that you are authorized to bind that business.

### 1.3 Account registration and accuracy

You agree to provide accurate **name**, **email**, **phone number**, **delivery address**, and **pincode**, and to keep them updated. Orders are fulfilled based on the information you provide. You are responsible for safeguarding your account credentials and for all activity under your account.

### 1.4 Ordering and scheduling

- Orders are placed for meals on **specific dates** chosen at checkout. Our platform enforces scheduling rules (e.g. orders may only be accepted for dates within a defined advance window — **align this sentence with your product**, e.g. “1 to 3 days in advance” if that remains true).
- Menu items, prices, availability, and kitchen operating details are set by kitchens and/or administrators. We may refuse or cancel orders that violate policy, law, or operational limits.

### 1.5 Pricing, fees, and taxes

- **Item prices** are displayed before payment. Your **order total** may include **platform fees**, **delivery fees**, **kitchen fees**, and **applicable taxes** as shown at checkout. **No hidden charges:** everything that forms part of the amount payable must be disclosed before you confirm payment.
- We **do not hold a GST registration** at present. If we register for GST or are required to collect or display taxes differently in the future, we will update checkout and these Terms accordingly.

### 1.6 Payment

- Payments are processed by **Razorpay** (or other processors we enable). By paying, you agree to Razorpay’s terms and privacy practices in addition to ours.
- **Payment methods** may include UPI, cards, net banking, wallets, and other methods Razorpay supports in your region. Available methods are shown at checkout.
- **Failed payments:** If payment does not complete or is not confirmed successfully, no valid paid order is formed (or your order remains unpaid, per your technical flow). You may retry using a supported method.
- **Credits / wallet:** If your app uses **in-app credits** (Rupee balance), those credits are governed by the same terms unless we publish separate wallet rules. **[Describe how credits are earned, used, and expired, if applicable.]**

### 1.7 Cancellation and changes

Cancellation, modification, and refund eligibility are governed by our **Refund & Cancellation Policy** (Section 3 below), which forms part of these Terms.

### 1.8 User conduct

You agree not to: misuse the platform; harass staff, kitchens, or delivery partners; place fraudulent orders; abuse promotions; attempt to circumvent payment; scrape or reverse engineer the service; or use the service for any unlawful purpose. We may suspend or terminate accounts for violations.

### 1.9 Kitchen and delivery partner roles

**Kitchens** prepare food as per their menus. **Delivery partners** (where used) perform last-mile delivery. While we facilitate coordination, **operational execution** may be performed by independent parties. See **Food safety and quality** (Section 8) and **Delivery** (Section 4).

### 1.10 Intellectual property

NutriTiffin name, logo, software, and content we create are our property or our licensors’. You may not copy or exploit them without permission.

### 1.11 Disclaimers

The service is provided **“as is”** to the maximum extent permitted by law. We do not warrant uninterrupted or error-free operation. To the extent permitted by law, we disclaim implied warranties.

### 1.12 Limitation of liability

To the maximum extent permitted by **Indian law**, we are not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, goodwill, or data. Our aggregate liability arising out of your use of the service shall not exceed **[choose: the fees paid by you for the specific order giving rise to the claim / INR X / as permitted by law]** in the **[12]** months preceding the claim, except where liability cannot be excluded (e.g. death or personal injury caused by negligence, fraud, or other non-excludable rights).

### 1.13 Indemnity

You agree to indemnify and hold harmless NutriTiffin and its affiliates, officers, and employees against claims arising from your misuse of the service, violation of these Terms, or violation of third-party rights, subject to applicable law.

### 1.14 Disputes and governing law

These Terms are governed by the laws of **India**. Courts at **Puducherry (Pondicherry), India** shall have exclusive jurisdiction, subject to mandatory consumer protection rules that may give you rights in your place of residence.

### 1.15 Changes

We may update these Terms by posting a new version and updating the “Last updated” date. Continued use after changes constitutes acceptance where permitted by law.

### 1.16 Contact

See **Section 5 — Contact Us**.

---

## 2. Privacy Policy

**NutriTiffin** — Privacy policy  
**Last updated:** [DATE]  
**Operator:** NutriTiffin (community-based service), **Puducherry (Pondicherry), 605001**, India.

### 2.1 Scope

This policy describes how we collect, use, store, and share personal information when you use our website, mobile apps, and related services.

### 2.2 Information we collect

- **Identity & contact:** name, username, email address, phone number.
- **Delivery & location:** delivery address, **pincode** (used for serviceability and routing).
- **Account & security:** password (stored hashed), verification tokens/OTPs as applicable, session/auth tokens.
- **Order data:** items ordered, kitchen, scheduled date, amounts, fees, taxes, order status history.
- **Payment data:** payments are processed by **Razorpay**. We may receive **payment references** (e.g. order id, payment id, status, amount) but **not** your full card number. Card/UPI details are handled by Razorpay under PCI-DSS and their policies.
- **Device & notifications:** if you opt in, **push notification tokens** (e.g. FCM) for order updates.
- **Media:** if you upload images (e.g. profile or kitchen photos), we may store them on **cloud storage** (e.g. AWS S3) as configured for the product.
- **Support & communications:** messages you send to support, email/SMS content required to operate the service.
- **Technical logs:** IP address, device/browser type, timestamps, and diagnostic data for security and reliability.

### 2.3 Legal bases (if applicable)

We process personal data as necessary to **perform our contract** with you, comply with **legal obligations**, protect **legitimate interests** (fraud prevention, analytics, service improvement), or based on **consent** where required.

### 2.4 How we use information

- Create and manage accounts; authenticate users.
- Place, schedule, fulfill, and track orders; calculate totals, fees, and taxes.
- Process payments and refunds (including coordination with Razorpay).
- Send **transactional** messages only (OTP, order status, receipts, support). **We do not run paid advertising** and do not use your data to serve third-party ads.
- Operate credits/wallet features if enabled.
- Improve the product, troubleshoot, and secure the platform.

### 2.5 Sharing with third parties

We may share data with:

- **Razorpay** (payments).
- **Cloud/hosting, email/SMS, analytics, error monitoring** providers.
- **Kitchens** (order details needed to prepare food) and **delivery partners** (delivery address, phone, order id) as needed for fulfillment.
- **Authorities** when required by law or to protect rights and safety.

We do **not** sell your personal information. We do **not** use advertising networks or behavioral ad targeting on the service.

### 2.6 International transfers

Data may be processed in India and, if you use global cloud regions, in other countries with appropriate safeguards as required by law.

### 2.7 Retention

We retain personal and order-related information for **up to three (3) years** after the last relevant activity (e.g. last order or account closure), or longer if **law, tax, or dispute resolution** requires it. This supports records such as **payment references, order history, and communications** that may be needed for complaints, chargebacks, or regulatory requests.

### 2.8 Security

We use administrative, technical, and organizational measures appropriate to the risk (encryption in transit where applicable, access controls, secure password hashing). No method is 100% secure.

### 2.9 Your rights

Subject to Indian law (including the **Digital Personal Data Protection Act, 2023** and rules as applicable), you may request access, correction, deletion, or grievance redressal. Contact **support@NutriTiffin.com** (also used for privacy-related requests and grievances for this community-operated service).

### 2.10 Children

The service is not directed at children under **[16/18 — pick per your policy]**. Do not register if you are under the age of majority.

### 2.11 Changes

We will post updates here and revise the “Last updated” date.

---

## 3. Refund & Cancellation Policy

**Last updated:** [DATE]

### 3.1 General

This policy explains when you can cancel an order and when refunds apply. It must match **your actual operations** and what your support team can execute (including manual Razorpay refunds if the kitchen rejects a paid order).

### 3.2 Customer cancellation (by you)

- **Before the kitchen accepts** the order (order status still **pending**): you may cancel and will receive a **full refund** of the amount you paid for that order (to the **original payment method**, subject to Section 3.5).
- **After the kitchen has accepted** the order: **no refund** if **you** cancel. Food preparation and logistics are committed at that point; please only place orders you intend to keep.

### 3.3 Kitchen / platform cancellation

- If the **kitchen rejects** the order (or the platform cancels before acceptance due to unavailability or policy), you will receive a **full refund** of the amount paid for that order.
- If specific items become **unavailable** after payment but before fulfillment, we will refund the **affected amount** or the **full order**, as fairly determined in the circumstances.

### 3.4 Wrong, missing, or unacceptable orders

- If you receive the **wrong items**, **missing items**, or food that is **unsafe or clearly not as described**, contact support within **[24] hours** of delivery with **[photos / order id]**. We will investigate and may offer **replacement**, **partial refund**, or **full refund** at our discretion based on findings.

### 3.5 Refund method and timeline

- **Paid via Razorpay:** Refunds are initiated to the **original payment method** unless we agree otherwise (e.g. **wallet credit**).
- **Timeline:** After approval, refunds typically reflect within **[5–7]** business days, depending on **banks, card networks, and Razorpay** processing times.
- **Credits:** If we refund to your **NutriTiffin wallet/credits**, the balance may update **immediately** after internal approval.

### 3.6 Non-refundable cases

- **Customer-initiated cancellation after the kitchen has accepted** the order: **no refund** (see Section 3.2).
- Other cases (e.g. abuse of refunds, fraudulent claims) may be declined where permitted by law; we will act in good faith.

### 3.7 Chargebacks and disputes

If you initiate a **chargeback**, we may share order and delivery records with Razorpay and financial partners. Please contact us first so we can resolve the issue.

### 3.8 Contact for refunds

**support@NutriTiffin.com** | **Phone: [PHONE]** | **Hours: [HOURS]**

---

## 4. Shipping / Delivery Policy

**Last updated:** [DATE]

### 4.1 Service area

Delivery is available only to **pincodes / areas** enabled on the platform (our backend supports an **allowed pincode** list). Enter your pincode at **[checkout / signup]** to confirm serviceability. We may change service areas over time.

### 4.2 Scheduled delivery

Orders are tied to a **scheduled date** selected at purchase. Delivery time windows, if any, are shown in the app or communicated after the kitchen accepts the order. **[State typical lunch/dinner windows, e.g. “Lunch: 11:30–14:00”].**

### 4.3 Fees

**Delivery fees** (if any) are shown **before payment** as part of the order breakdown.

### 4.4 Delays

Weather, traffic, kitchen capacity, or force majeure may cause delays. We will use reasonable efforts to notify you. **Delivery time estimates are not guarantees** unless you explicitly promise otherwise.

### 4.5 Failed delivery

If delivery cannot be completed because **you are unreachable**, **address is incorrect**, or **you refuse acceptance** without a valid quality dispute, the order may be treated as **fulfilled** or **forfeited** per your rules. **[State whether reattempts are offered, fees apply, etc.]**

### 4.6 Order tracking

Order status progresses through stages such as **pending → accepted → ready → picked up → out for delivery → delivered** (exact labels may match your app). Push notifications may be used if enabled.

### 4.7 Packaging

Kitchens are responsible for **packaging** suitable for transport unless you centralize packaging. **[Clarify your model.]**

---

## 5. Contact Us

Publish this on a dedicated **Contact** page (Razorpay / KYC expects clear contact details).

| Field | Value |
|--------|--------|
| **Business / brand name** | NutriTiffin |
| **Legal status** | Community-based service; **not** a registered company at present (may incorporate later if the service scales). |
| **Operational address** | Puducherry (Pondicherry), **605001**, India |
| **Support & privacy / grievance** | **support@NutriTiffin.com** |
| **Phone** | [+91-XXXXXXXXXX] |
| **Business hours** | [e.g. Mon–Sat 9:00–18:00 IST] |
| **GSTIN** | Not registered for GST at present; will add if required later. |

**Note:** Use a **monitored** inbox and working phone; Razorpay reviewers often verify credibility. An informal/community operator may still need **personal KYC and bank details** for the Razorpay account—check Razorpay’s current onboarding requirements.

---

## 6. Payment-related disclosures (for Terms and/or checkout)

Short copy you can place **on the checkout page** and repeat or link in Terms:

- **Processor:** Payments are securely processed by **Razorpay**.
- **Methods:** UPI, debit/credit cards, net banking, and other methods shown at checkout.
- **Charges:** Your total includes **food subtotal** and any **platform, delivery, kitchen, and tax** components shown before you pay.
- **Confirmation:** You will receive **confirmation** in-app and/or by email/SMS when payment and order placement succeed.
- **Refunds:** See our **Refund & Cancellation Policy**; refunds are processed to the **original payment method** unless stated otherwise, within **[5–7]** business days after approval.
- **Failed payments:** Unsuccessful transactions are not charged; pending authorizations, if any, are released per bank/Razorpay rules.
- **Disputes:** Email **support@NutriTiffin.com** with your order id before filing a chargeback where possible.

---

## 7. Food safety, quality, and marketplace disclosures (strongly recommended)

Use as a section in **Terms** or a standalone **Food Safety & Quality** page.

### 7.1 Food safety

Food is prepared by **independent kitchens** registered or listed on NutriTiffin. We may verify certain documents (**e.g. FSSAI** where applicable), but **ultimate responsibility for safe food handling, hygiene, labeling, and regulatory compliance** rests with the preparing kitchen, subject to law.

### 7.2 Allergens and special diets

Users must review item descriptions and disclose allergies when ordering. **[State if allergen info is guaranteed or “as provided by kitchen”.]**

### 7.3 Hygiene and quality disclaimer

While we expect partners to meet hygiene standards, **individual experiences may vary**. Report concerns immediately via **support@NutriTiffin.com**.

### 7.4 Delivery partner responsibility

Delivery partners are expected to handle orders carefully and follow delivery instructions. Issues caused **after handover** (e.g. tampering, delay due to customer unavailability) may be assessed case by case.

### 7.5 Vendor / kitchen terms

If you operate a **marketplace**, publish **Kitchen Partner Terms** covering payouts, cancellations, quality, and FSSAI obligations.

---

## 8. Razorpay account — KYC & business documents checklist

Prepare clear scans/PDFs (legible, full document visible). Because NutriTiffin is **not** incorporated yet, Razorpay will often treat onboarding as **individual / sole proprietor / freelancer-style** until you register a company—confirm their latest checklist.

### 8.1 Individual / proprietor (typical)

- **PAN** (individual; and business PAN later if you register)
- **Aadhaar** or government **address proof**
- **Bank account proof** (cancelled cheque / bank statement with IFSC)
- **Business proof (when you have it):** GST (if you register), **Udyam** / **Shop & Establishment** / partnership deed / **Certificate of Incorporation** as applicable. **You do not have GST today**—that is acceptable only if Razorpay’s product tier allows it; otherwise they may ask for alternate documentation.

### 8.2 Food business (highly recommended / often required)

- **FSSAI license** for the operating entity or applicable category (basic/state/central as per scale)

### 8.3 Company / LLP

- **COI**, **LLP agreement**, **Board resolution** / authorized signatory proof if requested

### 8.4 Website/app proof for review

- Live URL or test build with **real-looking** flows (no “coming soon” checkout).
- **Policy links** in footer and at checkout.

---

## 9. Website / app requirements (Razorpay manual review)

Use as an internal go-live checklist:

| Requirement | Notes |
|-------------|--------|
| Functional catalog | Users can browse **food items** and kitchens/menus. |
| Cart & checkout | Add to cart, see **full price breakdown**, complete **Razorpay** payment in test/live as applicable. |
| No placeholder checkout | “Coming soon” or broken pay buttons are common rejection reasons. |
| Transparent pricing | Show item prices + **platform / delivery / tax** lines matching backend logic. |
| Policies visible | Terms, Privacy, Refund, Delivery, Contact — linked from footer **and** checkout. |
| Contact details | Email, phone, **operational address** (Puducherry 605001) on Contact page. |
| Refund policy | Clear **conditions + timeline** (Section 3). |

**Aligned with this backend (for your dev checklist):**

- **Razorpay flow:** `POST /payments/initiate` → client completes Razorpay → `POST /payments/confirm` with signature verification; order is stored with `paymentStatus: PAID` and Razorpay ids.
- **Legacy path:** `POST /orders` can create orders with `paymentStatus: PENDING` without Razorpay — your published policy should state **when** each path is used so users are not confused.
- **Scheduling:** Orders use `scheduled_for` (**date**) with validation for **1–3 days in advance** in current server logic — keep marketing copy consistent.
- **Serviceability:** **Allowed pincodes** table — publish “we deliver to listed areas” or call **`GET /is-my-district-available?pincode=<pincode>`** (JSON boolean: whether that pincode is active). **Admin-only:** `POST /is-my-district-available` (body `{ "pincode": number }`) and `DELETE /is-my-district-available/:pincode` to add/deactivate pincodes. There is **no public route** that returns the full list; `getAllPincodes()` in code is unused by HTTP unless you add a controller method.
- **Wallet:** User **`credits`** field and transaction ledger — disclose in Terms/Privacy if exposed in the product.

---

## 10. Optional trust pages (recommended)

- **About Us** — mission, team, service cities, food philosophy.
- **FAQ** — scheduling, payment failures, refunds, delivery windows, allergies.
- **Order tracking** — explain statuses (**PENDING**, **ACCEPTED**, **READY**, **PICKED_UP**, **OUT_FOR_DELIVERY**, **DELIVERED**, **REJECTED**).

---

## 11. Implementation snippet — footer links (example)

```html
<nav aria-label="Legal">
  <a href="/terms">Terms &amp; Conditions</a>
  <a href="/privacy">Privacy Policy</a>
  <a href="/refunds">Refunds &amp; Cancellations</a>
  <a href="/delivery">Delivery</a>
  <a href="/contact">Contact</a>
</nav>
```

At checkout, add a line such as:  
*“By placing an order, you agree to our Terms, Privacy Policy, and Refund Policy.”* (with links).

---

**Reminder:** Update Section 3 if you automate **refunds on kitchen rejection** in the future; until then, your published timeline should reflect **manual** Razorpay refunds from support/finance.
