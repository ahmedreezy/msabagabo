-- Add the confirmed MSMC Metropolitan Development Forum to an existing
-- Community-Based Services CMS record without replacing other department data.
with confirmed_content as (
  select
    $json$[
      {
        "id": "metropolitan-development-forum",
        "name": "MSMC Metropolitan Development Forum",
        "acronym": "MDF",
        "summary": "A representative municipal platform connecting residents, organised groups, institutions, businesses and public agencies with urban development and service-delivery processes.",
        "purpose": "The forum supports citizen engagement, transparency and accountability and provides community-level monitoring and oversight of municipal development, including activities under the Greater Kampala Metropolitan Area Urban Development Programme.",
        "sourceTitle": "Confirmed MSMC Metropolitan Development Forum member list",
        "lastReviewed": "2026-10-14",
        "members": [
          { "id": "mdf-01", "name": "Mr. Seruwagi Patrick", "category": "Non- Governmental Organisations" },
          { "id": "mdf-02", "name": "Ms. Diana Sserukenya", "category": "The Academia / Educational Institutions" },
          { "id": "mdf-03", "name": "Ms.Namaganda Margaret", "category": "Women Groups and Associations" },
          { "id": "mdf-04", "name": "Mr. Kyeyune Christopher Peter", "category": "Elderly" },
          { "id": "mdf-05", "name": "Mr. Bikumbi Tonny", "category": "Musicians and Art performers" },
          { "id": "mdf-06", "name": "Owek. Appollo Makubiya", "category": "Hotel Industry, Leisure, Guest Houses and Hospitality" },
          { "id": "mdf-07", "name": "Dr. Kazibwe Sam", "category": "Media House (including Electronic,Print and social media)" },
          { "id": "mdf-08", "name": "Mr. Ssemmambo Frank", "category": "Cultural leaders and institutions" },
          { "id": "mdf-09", "name": "Mr. Mawelele Simon", "category": "Security Agencies" },
          { "id": "mdf-10", "name": "Mr. Byamukama Alfred", "category": "District Official" },
          { "id": "mdf-11", "name": "Mr. Mwesigwa Stuart", "category": "Manufacturers and small scale industries" },
          { "id": "mdf-12", "name": "Mr. Sejjengo Baker", "category": "Landlords and property managers" },
          { "id": "mdf-13", "name": "Ms. Muwanga Tina", "category": "Professional Agencies (Architects)" },
          { "id": "mdf-14", "name": "Mr. Kasumba Hardman", "category": "Unique service provider" },
          { "id": "mdf-15", "name": "Mr. Mugambe Keneth", "category": "Senior citizen" },
          { "id": "mdf-16", "name": "Mr. Muwonge Hamza", "category": "Academia" },
          { "id": "mdf-17", "name": "Ms. Magembe Eva Nalumiisa", "category": "Business community (small and medium enterprise)" },
          { "id": "mdf-18", "name": "Mr. Bagonza Benson", "category": "Banking and Microfinance institutions" },
          { "id": "mdf-19", "name": "Ms. Angella N. Kinene", "category": "Hotel Industry, Leisure, Guest Houses and Hospitality" },
          { "id": "mdf-20", "name": "Mr. Kabigumira Badru", "category": "Market and street vendors" },
          { "id": "mdf-21", "name": "Mr. Kayemba Deo", "category": "Large scale manufacturer" },
          { "id": "mdf-22", "name": "Mr. Ssebunya Moses", "category": "Market owner" },
          { "id": "mdf-23", "name": "Ms. Enid Naikoba", "category": "Development partners" },
          { "id": "mdf-24", "name": "Ven. Rev. Canon. Isaac Membe Kijjambu", "category": "Faith Based Organisations" },
          { "id": "mdf-25", "name": "Ms. Baluka Sharifah", "category": "Utility Agencies and parastatals" },
          { "id": "mdf-26", "name": "Mr. Sserwada Musa Wahabu", "category": "Urban poor/ slum dwellers/ federations/ organized communities" },
          { "id": "mdf-27", "name": "Mr. Tusubira Andrew Benon", "category": "PLWHIDS" },
          { "id": "mdf-28", "name": "Mr. Ssemakula Hassan", "category": "Fishing community" },
          { "id": "mdf-29", "name": "Ms. Muwanga Trudy", "category": "Climate change enthusiast" },
          { "id": "mdf-30", "name": "Mr. Njagala Muhamood", "category": "Business community (big enterprise)" },
          { "id": "mdf-31", "name": "Mr. Kasujja Umaru", "category": "Youth Associations or leaders (male and female)" },
          { "id": "mdf-32", "name": "Mr. Simon Siisi", "category": "Utility Service provider" },
          { "id": "mdf-33", "name": "Eng. J.B Walusimbi", "category": "Professional Agencies (Engineers)" },
          { "id": "mdf-34", "name": "Ms. Namawejje Agnes", "category": "People with Disabilities" },
          { "id": "mdf-35", "name": "Mr. Kimuli Godfrey", "category": "Transporters" },
          { "id": "mdf-36", "name": "Mr. Sebalamu John", "category": "Big tax payer" }
        ]
      }
    ]$json$::jsonb as public_bodies,
    $json$[
      {
        "id": "community-mdf-purpose",
        "question": "What is the Metropolitan Development Forum?",
        "answer": "The MSMC Metropolitan Development Forum is an apolitical representative platform that brings together municipal stakeholders to strengthen citizen engagement, transparency and accountability. It supports public participation and provides community-level monitoring and oversight of urban development, service delivery and Greater Kampala Metropolitan Area Urban Development Programme activities."
      },
      {
        "id": "community-mdf-representation",
        "question": "Who is represented on the MSMC Metropolitan Development Forum?",
        "answer": "The confirmed forum has 36 members representing community, professional, business, cultural, faith-based, public-sector and civil-society interests. The full member directory and each person’s represented category are published in the Metropolitan Development Forum section on this page."
      }
    ]$json$::jsonb as new_faqs
)
update public.cms_entries as entry
set payload = jsonb_set(
  jsonb_set(entry.payload, '{publicBodies}', confirmed_content.public_bodies, true),
  '{faqs}',
  coalesce(entry.payload -> 'faqs', '[]'::jsonb) || (
    select coalesce(jsonb_agg(new_faq), '[]'::jsonb)
    from jsonb_array_elements(confirmed_content.new_faqs) as new_faq
    where not exists (
      select 1
      from jsonb_array_elements(coalesce(entry.payload -> 'faqs', '[]'::jsonb)) as existing_faq
      where existing_faq ->> 'id' = new_faq ->> 'id'
    )
  ),
  true
)
from confirmed_content
where entry.collection = 'departments'
  and entry.slug = 'community-services';
