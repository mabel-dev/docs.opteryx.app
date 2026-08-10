---
title: Terms of Service
status: DRAFT — requires legal review before publication
effective: "{{EFFECTIVE_DATE}}"
version: "1.0-draft"
---

# Opteryx Terms of Service

**Effective date: {{EFFECTIVE_DATE}}**

These Terms of Service (the "**Terms**") are a legal agreement between
**{{LEGAL_ENTITY}}**, a company registered in {{JURISDICTION}} under company
number {{COMPANY_NUMBER}}, whose registered office is at {{REGISTERED_ADDRESS}}
("**Opteryx**", "**we**", "**us**"), and the person or organisation that
registers for or uses the Service ("**you**", "**Customer**").

By creating an account, accessing the Service, or clicking to accept these
Terms, you agree to them. If you are accepting on behalf of an organisation,
you confirm you have authority to bind that organisation, and "you" means that
organisation.

---

## 1. Definitions

| Term | Meaning |
| --- | --- |
| **Service** | The hosted Opteryx platform, including Opteryx Studio at `opteryx.app`, the Authentication, Billing, Jobs, OData, Policy and Upload APIs, and any associated documentation, SDKs and client libraries we make available. |
| **Open Source Software** | The Opteryx query engine and related projects published at `github.com/mabel-dev/opteryx`, licensed separately under their own open source licences. |
| **Customer Data** | Data, files, datasets, queries and other content you or your Authorised Users upload to, generate in, or transmit through the Service. |
| **Authorised User** | An individual you permit to access the Service under your account, including members of your Billing Account and Workspaces. |
| **Workspace** | The isolation and access-control boundary within the Service, as described in the Documentation. |
| **Billing Account** | The account to which usage charges are consolidated and invoiced. |
| **Documentation** | The technical documentation published at `docs.opteryx.app`. |
| **Fees** | The charges payable for your use of the Service, as set out in Section 6. |

## 2. The Service and the Open Source Software are different things

The Open Source Software is licensed to you under its own open source licence,
**not** under these Terms. Nothing in these Terms restricts your rights under
that licence, and nothing in that licence gives you any right to the Service.

These Terms govern only the hosted Service. Where the two conflict in respect of
the hosted Service, these Terms prevail.

## 3. Eligibility and accounts

3.1 You must be at least 18 years old, or the age of majority in your
jurisdiction, to use the Service.

3.2 Accounts are created by signing in through a supported identity provider
(currently Google, Microsoft and GitHub) or, for organisation-managed accounts,
through single sign-on. You are responsible for maintaining the accuracy of your
account details.

3.3 **Credentials.** API tokens, client credentials and personal access tokens
issued by the Service are secrets. You are responsible for keeping them
confidential and for all activity conducted with them, whether or not authorised
by you. Notify us at {{SECURITY_EMAIL}} immediately if you believe a credential
has been compromised.

3.4 **Authorised Users.** You are responsible for your Authorised Users' use of
the Service and for their compliance with these Terms. Access within a Workspace
is governed by the grants you configure; it is your responsibility to configure
them appropriately.

## 4. Your rights to use the Service

Subject to these Terms and to payment of the Fees, we grant you a
non-exclusive, non-transferable, non-sublicensable right to access and use the
Service during the term, for your internal business purposes.

## 5. Customer Data

5.1 **Ownership.** As between you and us, you own all right, title and interest
in Customer Data. We acquire no ownership in it.

5.2 **Licence to us.** You grant us a worldwide, non-exclusive, royalty-free
licence to host, store, copy, transmit, index, reformat and display Customer
Data **solely** to the extent necessary to provide, secure, maintain and support
the Service, and as otherwise permitted by the Data Processing Addendum.

5.3 **Your responsibilities.** You represent and warrant that you have all
rights, consents and lawful bases necessary to upload Customer Data to the
Service and to permit the processing contemplated by these Terms, and that
Customer Data does not infringe the rights of any third party.

5.4 **Data protection.** Where we process personal data on your behalf, we do so
as processor and you as controller, on the terms of the
[Data Processing Addendum](./data-processing-addendum.md), which forms part of
these Terms.

5.5 **Aggregated data.** We may compile aggregated and de-identified statistics
about use of the Service (for example query volumes and performance
characteristics) and use them to operate and improve the Service, provided such
statistics do not identify you, your Authorised Users, or the contents of
Customer Data.

5.6 **We do not train models on Customer Data.** We do not use Customer Data to
train machine learning models, and we do not disclose Customer Data to third
parties for that purpose.

## 6. Fees, billing and taxes

6.1 **Plans and pricing.** The Service is offered on Free, Paid and Enterprise
plans. Current allowances and unit prices are published in the Documentation at
`docs.opteryx.app` and form part of these Terms.

6.2 **Usage-based charging.** Paid usage is metered by storage, query count and
data processed, calculated per calendar month and consolidated to your Billing
Account. Units and charges are rounded as described in the published cost model.
Our measurement records are the definitive record of usage, absent manifest
error.

6.3 **Currency and tax.** Fees are stated in **GBP and exclusive of VAT** and any
other applicable taxes, duties or withholdings, which you must pay in addition
at the prevailing rate.

6.4 **Payment.** Invoices are issued monthly in arrears and are payable within
{{PAYMENT_TERMS_DAYS}} days of the invoice date, by the payment method attached
to your Billing Account. Payment card details are collected and processed by our
payment processor, {{PAYMENT_PROCESSOR}}; we do not store full card numbers.

6.5 **Late payment.** We may charge interest on overdue sums at
{{LATE_INTEREST_RATE}}, accruing daily. For business customers, statutory
interest and compensation under the Late Payment of Commercial Debts (Interest)
Act 1998 may apply.

6.6 **No Billing Account.** If no valid payment method is configured, usage is
capped at Free plan limits and further usage is blocked rather than billed.

6.7 **Price changes.** We may change prices and plan allowances on **not less
than 30 days' notice**, given by email to your Billing Account contact or by
notice in the Service. Changes take effect at the start of the next billing
month following the notice period. If a change increases your Fees and you do
not accept it, you may terminate under Section 10.2 before it takes effect; your
continued use after the effective date constitutes acceptance.

6.8 **Free plan.** The Free plan is provided without charge and without any
service level commitment. We may change, limit or withdraw the Free plan at any
time on reasonable notice.

6.9 **Disputes.** If you dispute an invoice in good faith, notify us within 30
days of the invoice date with reasonable detail. You must pay the undisputed
portion on time; we will work with you in good faith to resolve the balance.

## 7. Acceptable use

Your use of the Service is subject to the
[Acceptable Use Policy](./acceptable-use-policy.md), which forms part of these
Terms. We may suspend access under Section 10.4 for breach of that policy.

## 8. Service levels, support and availability

8.1 Availability commitments for Paid and Enterprise plans, where offered, are
set out in the [Service Level Agreement](./service-level-agreement.md). Where no
SLA applies, the Service is provided on a reasonable-endeavours basis.

8.2 Support is provided as described in the
[Support Policy](./support-policy.md).

8.3 We publish operational status at `status.opteryx.app`. Publication of a
status page is not itself a warranty or commitment as to availability.

8.4 **Changes to the Service.** We develop the Service continuously and may add,
change or remove features. We will not make a change that materially degrades a
core function of the Service for Paid customers without reasonable prior notice
where practicable. Beta, preview and experimental features are provided "as is",
may be withdrawn at any time, and are excluded from any SLA.

## 9. Confidentiality

9.1 Each party may receive non-public information of the other that is marked
confidential or would reasonably be understood to be confidential
("**Confidential Information**"). Customer Data is your Confidential
Information.

9.2 The receiving party will use Confidential Information only to perform under
these Terms, protect it with at least reasonable care, and not disclose it
except to personnel and contractors bound by comparable obligations.

9.3 These obligations do not apply to information that is or becomes public
through no fault of the recipient, was known to the recipient without
restriction before disclosure, is independently developed, or is lawfully
received from a third party. Disclosure compelled by law is permitted, provided
the recipient gives prompt notice where legally able.

## 10. Term, termination and suspension

10.1 **Term.** These Terms run from account creation until terminated.

10.2 **Termination by you.** You may terminate at any time by closing your
account. You remain liable for Fees accrued up to termination.

10.3 **Termination by us.** We may terminate these Terms on 30 days' notice, or
immediately if you materially breach these Terms and fail to cure the breach
within 14 days of written notice (or immediately, where the breach is incapable
of cure).

10.4 **Suspension.** We may suspend all or part of your access immediately, with
notice as soon as reasonably practicable, where:

  (a) you breach the Acceptable Use Policy;
  (b) your use poses a security risk to the Service or to other customers, or
      threatens the integrity or performance of the Service;
  (c) an invoice is more than {{SUSPENSION_DAYS}} days overdue and remains
      unpaid 7 days after a written reminder; or
  (d) we are required to do so by law.

We will limit any suspension in scope and duration to what is reasonably
necessary, and restore access promptly once the cause is resolved.

10.5 **Effect of termination.** On termination, your right to use the Service
ends and Customer Data is deleted in accordance with the
[Data Retention and Deletion Policy](./data-retention-and-deletion.md). You are
responsible for exporting Customer Data before termination takes effect.

10.6 **Survival.** Sections 5.1, 9, 11, 12, 13 and 16 survive termination,
together with any other provision that by its nature should survive.

## 11. Warranties and disclaimers

11.1 Each party warrants that it has authority to enter into these Terms.

11.2 We warrant that we will provide the Service with reasonable skill and care.

11.3 **Except as expressly stated in these Terms, and to the fullest extent
permitted by law, the Service is provided "as is" and we disclaim all other
warranties, conditions and representations, whether express, implied or
statutory, including any implied warranty of satisfactory quality, fitness for a
particular purpose, or non-infringement.**

11.4 We do not warrant that the Service will be uninterrupted, error-free, or
free of harmful components, or that it will meet your requirements. The Service
is not designed or licensed for use in safety-critical applications where
failure could lead to death, personal injury or environmental harm.

11.5 The Service depends on third-party infrastructure and identity providers.
We are not responsible for failures caused by those third parties beyond our
reasonable control, save as set out in the SLA.

## 12. Limitation of liability

12.1 **Nothing in these Terms limits or excludes either party's liability for:**
death or personal injury caused by negligence; fraud or fraudulent
misrepresentation; breach of the terms implied by section 2 of the Supply of
Goods and Services Act 1982 or section 12 of the Sale of Goods Act 1979; or any
other liability that cannot lawfully be limited or excluded.

12.2 Subject to 12.1, neither party is liable for: loss of profits, revenue,
anticipated savings, business, goodwill or reputation; loss or corruption of
data (save as set out in 12.4); or any indirect or consequential loss, in each
case whether or not foreseeable.

12.3 Subject to 12.1, each party's total aggregate liability arising out of or in
connection with these Terms, whether in contract, tort (including negligence),
breach of statutory duty or otherwise, is limited to the **greater of
{{LIABILITY_FLOOR}} and the total Fees paid or payable by you in the 12 months
immediately preceding the event giving rise to the claim**.

12.4 **Backups.** You are responsible for maintaining your own copies of
Customer Data. Our liability for loss or corruption of Customer Data is limited
to using reasonable endeavours to restore it from our most recent available
backup.

12.5 The exclusions in 12.2 and the cap in 12.3 do not apply to your obligation
to pay Fees, or to either party's liability under Section 13.

## 13. Indemnities

13.1 **By us.** We will defend you against any third-party claim that the
Service, as provided by us and used in accordance with these Terms, infringes
that third party's intellectual property rights, and will pay damages finally
awarded or agreed in settlement. This does not apply to claims arising from
Customer Data, from combination of the Service with anything not supplied by us,
or from use in breach of these Terms. If the Service becomes, or we reasonably
believe it may become, subject to such a claim, we may procure the right to
continue use, modify the Service, or terminate the affected part on notice with
a pro-rata refund of prepaid Fees.

13.2 **By you.** You will indemnify us against any third-party claim arising
from Customer Data or from your breach of the Acceptable Use Policy.

13.3 Each indemnity is conditional on the indemnified party giving prompt
notice, granting sole control of the defence, and providing reasonable
cooperation at the indemnifying party's expense.

## 14. Publicity

Neither party may use the other's name or logo publicly without prior written
consent, except that we may identify you as a customer in a customer list on
request-and-approval basis. You may withdraw consent at any time by writing to
{{LEGAL_EMAIL}}.

## 15. Changes to these Terms

We may amend these Terms. For material changes we will give at least 30 days'
notice by email or in-Service notification, and the change takes effect at the
end of that period. Non-material changes (clarifications, corrections, changes
required by law) take effect on publication. If you do not accept a material
change, your remedy is to terminate under Section 10.2 before it takes effect.
The current version is always published at {{TERMS_URL}}.

## 16. General

16.1 **Force majeure.** Neither party is liable for failure to perform (other
than payment obligations) caused by events beyond its reasonable control.

16.2 **Assignment.** Neither party may assign these Terms without the other's
consent, except that either may assign to an affiliate or in connection with a
merger or sale of substantially all assets, on notice.

16.3 **Subcontracting.** We may use subcontractors and sub-processors to provide
the Service and remain responsible for their performance. Current sub-processors
are listed at [Sub-processors](./sub-processors.md).

16.4 **Notices.** Notices to us go to {{LEGAL_EMAIL}}. Notices to you go to the
email address on your Billing Account.

16.5 **Entire agreement.** These Terms, together with the AUP, DPA, SLA and any
order form, are the entire agreement between the parties on this subject and
supersede all prior discussions. Neither party relies on any statement not set
out in them (but nothing excludes liability for fraudulent misrepresentation).

16.6 **No waiver.** Failure to enforce a provision is not a waiver of it.

16.7 **Severability.** If any provision is held unenforceable, the rest remains
in force and the provision is modified to the minimum extent necessary.

16.8 **Third parties.** A person who is not a party has no right under the
Contracts (Rights of Third Parties) Act 1999 to enforce any of these Terms.

16.9 **Relationship.** Nothing creates a partnership, joint venture, agency or
employment relationship.

16.10 **Governing law and jurisdiction.** These Terms and any dispute arising
out of them (including non-contractual disputes) are governed by the law of
{{JURISDICTION}}, and the courts of {{JURISDICTION}} have exclusive
jurisdiction.

16.11 **Consumers.** If you use the Service as a consumer rather than in the
course of a business, you have statutory rights that these Terms do not affect,
including under the Consumer Rights Act 2015, and you may bring proceedings in
the courts of your country of residence. Sections 12.2 and 12.3 apply to you
only to the extent permitted by consumer law.

---

**Contact:** {{LEGAL_ENTITY}}, {{REGISTERED_ADDRESS}} · {{LEGAL_EMAIL}} ·
VAT registration number {{VAT_NUMBER}}
