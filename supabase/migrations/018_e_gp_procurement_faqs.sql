-- Publish all e-GP questions inside the Administration department's Procurement
-- and Disposal FAQ section. Remove the earlier document-style record if this
-- migration is rerun after a preview deployment.
delete from public.cms_entries
where collection = 'publications'
  and slug = 'e-government-procurement-faqs-and-answers';

with faq_rows(sort_order, id, question, answer) as (
  values
    (1, 'egp-01', 'What is e-GP?', 'e-GP (Electronic Government Procurement) is the procurement and disposal of public supplies, works and services through the internet.'),
    (2, 'egp-02', 'Why e-GP?', 'To improve efficiency and effectiveness in public procurement and disposal processes.'),
    (3, 'egp-03', 'What are its benefits?', 'The benefits include increased transparency in procurement and disposal processes; reduced corrupt tendencies because of less physical interaction; improved accountability; increased access to procurement opportunities; reduced bidding costs; and reduced administrative and response time.'),
    (4, 'egp-04', 'When will e-GP start in Makindye Ssabagabo Municipal Council?', 'It started in the Financial Year 2026/2027.'),
    (5, 'egp-05', 'Will the system be accessible by the public?', 'Yes. This is a public system and will be accessible to the public and anyone interested in government business.'),
    (6, 'egp-06', 'How will the system work?', 'It is an internet-based system that requires all users to have access to reliable internet services.'),
    (7, 'egp-07', 'Will there be training for the public?', 'Yes. All system users will be trained using various training materials. Providers are currently trained every Thursday, and the training link will be shared.'),
    (8, 'egp-08', 'Which government agencies are using e-GP 2.0?', 'The project will be introduced to 100 entities through a phased pilot approach. Other entities will be brought on board later.'),
    (9, 'egp-09', 'Will it be mandatory for government entities and bidders to use e-GP 2.0?', 'Yes. All government Ministries, Departments and Agencies will be required to conduct their procurements and disposals on the system. All bidders will be required to transact on the system.'),
    (10, 'egp-10', 'Will invitations for bids be advertised in newspapers alongside the electronic system?', 'Newspaper advertising will be optional. However, invitations for bids must be placed on the system.'),
    (11, 'egp-11', 'How will system failure be managed at crucial stages such as bid submission?', 'System failures related to bid submission will be handled by the responsible personnel on a case-by-case basis.'),
    (12, 'egp-12', 'Will evaluation of bids be done on the system?', 'Yes. All bid openings and evaluations will be conducted on the system, and bids will be evaluated using the system.'),
    (13, 'egp-13', 'How will Contracts Committee approvals be done on the system?', 'Contracts Committee members will log into the system to approve or reject submissions made to them by the Procurement and Disposal Unit.'),
    (14, 'egp-14', 'Will electronic signatures be required?', 'Yes. Digital signatures will be needed. Initially, individual user logins and approvals within the system will be used, and electronic signatures will be introduced later.'),
    (15, 'egp-15', 'Will the system be accessible on mobile phones?', 'Yes. Users will be able to access and view information on the system using internet-enabled mobile phones.'),
    (16, 'egp-16', 'Will the system allow clarifications before the bid submission deadline?', 'Yes. Bidders will be allowed to submit requests for clarification through the system before the bid submission deadline, and the response will be shared with all shortlisted bidders.'),
    (17, 'egp-17', 'Will the system allow a bidder to withdraw a bid or change a bid document?', 'Yes. The system will allow bidders to withdraw their bids, make changes and resubmit them. This flexibility applies only while the bid submission period remains open.'),
    (18, 'egp-18', 'Will the system use PPDA standard forms and Standard Bidding Documents?', 'Yes. The system will use PPDA standard forms and Standard Bidding Documents, but they will be simplified.'),
    (19, 'egp-19', 'How will bidders be notified if there is system downtime at the bid submission deadline?', 'Bidders will receive system-generated email and SMS notifications if the system is unavailable at the bid submission deadline.'),
    (20, 'egp-20', 'How will contract management be handled on the system?', 'The system has an e-Contract Management module through which contract implementation will be planned, monitored and recorded. Physical site visits will be conducted where necessary.'),
    (21, 'egp-21', 'Will there be training for suppliers?', 'Yes. Suppliers will be reached and trained in their respective regions of operation.'),
    (22, 'egp-22', 'How will the general public be sensitised about the use and benefits of e-GP?', 'Sensitisation will use different media, including radio and television, newspapers, social media, seminars and conferences.'),
    (23, 'egp-23', 'How will the media and non-state actors track government procurement activity?', 'The system will have a Guest Access Viewing platform that enables members of the public to access government procurement information.'),
    (24, 'egp-24', 'Will PPDA have contact centres in the districts to help users, bidders and entities use the system?', 'Yes. The Ministry of Finance, Planning and Economic Development, together with PPDA, will have contact centres in different regions to handle concerns raised by the public and bidders.'),
    (25, 'egp-25', 'Will government save money by adopting the system?', 'Yes. Savings will be realised through adoption of the system.'),
    (26, 'egp-26', 'Will bidding fees in the system be uniform?', 'Bidding fees will be determined by the relevant authorities.'),
    (27, 'egp-27', 'Will payments be made on the system?', 'Yes. Payments will be made through the e-payment gateway linked to the e-GP system.'),
    (28, 'egp-28', 'Is e-GP within the public procurement legal framework?', 'Yes. The e-Government Procurement system is built around the current procurement legal framework. It is also flexible enough to accommodate future changes in the law.'),
    (29, 'egp-29', 'How will e-GP help eliminate corruption in public procurement?', 'The system will increase transparency and improve accountability in procurement practices and procedures, thereby reducing corruption.'),
    (30, 'egp-30', 'Will bidders be allowed to submit bids outside the system?', 'No. All procurement and disposal submissions will be made through the system.'),
    (31, 'egp-31', 'Will supplier payments be made through the system?', 'No. Payments to suppliers will be made using the Financial Management Systems of the respective entities. These systems will be integrated with e-GP.'),
    (32, 'egp-32', 'Will suppliers need to be pre-qualified by multiple government entities?', 'No. There will be central registration for all potential providers on the system.'),
    (33, 'egp-33', 'How will suppliers register on e-GP, and what will the requirements be?', 'Suppliers will register themselves on the e-GP system.'),
    (34, 'egp-34', 'Will government provide internet access to users of the system?', 'No. Users will be responsible for obtaining internet access through Internet Service Providers.'),
    (35, 'egp-35', 'How will government entities without internet connectivity procure through the electronic system?', 'The Government’s position is that all entities should embrace electronic procurement.'),
    (36, 'egp-36', 'How will bidder information be protected during the open online bidding process?', 'The system will encrypt all submitted bids. They will become accessible only at the time of bid opening.'),
    (37, 'egp-37', 'Will the system replace other systems such as GPP and PPMS?', 'The e-GP system will accommodate these other systems.'),
    (38, 'egp-38', 'Will suppliers be required to register with the PPDA Register of Providers to use e-GP 2.0?', 'The Register of Providers will be embedded in e-GP 2.0; therefore, suppliers will register through e-GP.'),
    (39, 'egp-39', 'Will government train and certify internet cafés?', 'The Government of Uganda cannot accept liability for bidders transacting through internet cafés.'),
    (40, 'egp-40', 'Will the system retain the old procurement process for people who are not computer literate?', 'No. The old system will be replaced by e-GP 2.0.'),
    (41, 'egp-41', 'How will procurements that require delivery of physical samples be handled?', 'Where samples are required, suppliers will be asked to deliver them physically.'),
    (42, 'egp-42', 'How will the sustainability of e-GP be handled?', 'There is in-house support, and the vendor will undertake knowledge transfer to help resolve issues. The Government of Uganda also has a sustainability plan for the e-GP system.'),
    (43, 'egp-43', 'Will Local Governments, sub-counties and divisions be required to procure and dispose through the system?', 'Yes. All government Ministries, Departments and Agencies, including Local Governments, will be required to procure and dispose through the system. However, the divisions of Makindye Ssabagabo Municipal Council will not transact through e-GP 2.0 at this time.')
),
faq_pack as (
  select jsonb_agg(
    jsonb_build_object(
      'id', id,
      'question', question,
      'answer', answer,
      'sectorId', 'procurement',
      'sectionTitle', E'E-GOVERNMENT PROCUREMENT (e-GP 2.0 )\nFREQUENTLY ASKED QUESTIONS AND ANSWERS'
    ) order by sort_order
  ) as items
  from faq_rows
),
existing_faqs as (
  select entry.id,
    coalesce(jsonb_agg(item) filter (where coalesce(item ->> 'id', '') not like 'egp-%'), '[]'::jsonb) as items
  from public.cms_entries entry
  left join lateral jsonb_array_elements(coalesce(entry.payload -> 'faqs', '[]'::jsonb)) item on true
  where entry.collection = 'departments' and entry.slug = 'administration'
  group by entry.id
)
update public.cms_entries entry
set payload = jsonb_set(entry.payload, '{faqs}', existing_faqs.items || faq_pack.items, true),
    updated_at = now()
from existing_faqs, faq_pack
where entry.id = existing_faqs.id;
