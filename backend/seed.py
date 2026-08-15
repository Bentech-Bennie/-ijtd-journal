"""
seed.py — Populate the IJTD database with initial data.
Run:  python seed.py
"""
import os
import sys
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app, db
from app.models import Volume, Issue, Article, EditorialMember, Role, User

MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]


def seed_roles():
    """Create the four application roles."""
    print("  -> Seeding roles...")
    roles = [
        {"name": "admin",    "description": "Full system access"},
        {"name": "editor",   "description": "Manuscript and content management"},
        {"name": "reviewer", "description": "Assigned manuscript review"},
        {"name": "author",   "description": "Manuscript submission and tracking"},
    ]
    for r in roles:
        if not Role.query.filter_by(name=r["name"]).first():
            db.session.add(Role(**r))
    db.session.commit()
    print("     OK Roles seeded")


def seed_admin_user():
    """Create the default admin, editor, and reviewer users."""
    if User.query.filter_by(email="admin@ijtd.com").first():
        print("  -> Admin user already exists, skipping")
        return

    print("  -> Seeding admin, editor, and reviewer users...")
    admin_role    = Role.query.filter_by(name="admin").first()
    editor_role   = Role.query.filter_by(name="editor").first()
    reviewer_role = Role.query.filter_by(name="reviewer").first()

    admin = User(
        email="admin@ijtd.com",
        full_name="IJTD Administrator",
        role_id=admin_role.id,
        institution="ASAIE Publishing",
        country="Cameroon",
        is_active=True,
    )
    admin.set_password("Admin@IJTD2026!")
    db.session.add(admin)

    editor = User(
        email="editor@ijtd.com",
        full_name="Alain Pangop Cyr",
        role_id=editor_role.id,
        institution="University of Yaounde I",
        country="Cameroon",
        is_active=True,
    )
    editor.set_password("Editor@IJTD2026!")
    db.session.add(editor)

    reviewer = User(
        email="reviewer@ijtd.com",
        full_name="Dr. Sample Reviewer",
        role_id=reviewer_role.id,
        institution="University of Yaounde I",
        country="Cameroon",
        is_active=True,
    )
    reviewer.set_password("Reviewer@IJTD2026!")
    db.session.add(reviewer)

    db.session.commit()
    print("     OK Admin, editor, and reviewer users seeded")
    print("     IMPORTANT - CHANGE THESE PASSWORDS AFTER FIRST LOGIN:")
    print("        admin@ijtd.com     -> Admin@IJTD2026!")
    print("        editor@ijtd.com    -> Editor@IJTD2026!")
    print("        reviewer@ijtd.com  -> Reviewer@IJTD2026!")


def seed_volumes():
    """Create volumes 1-6 (2026-2031) with 12 issues each."""
    print("  -> Seeding volumes and issues...")
    for vol_num, year in enumerate(range(2026, 2032), start=1):
        vol = Volume.query.filter_by(number=vol_num).first()
        if not vol:
            vol = Volume(number=vol_num, year=year)
            db.session.add(vol)
            db.session.flush()   # get vol.id

        for issue_num, month in enumerate(MONTHS, start=1):
            issue = Issue.query.filter_by(volume_id=vol.id, number=issue_num).first()
            if not issue:
                db.session.add(Issue(volume_id=vol.id, number=issue_num, month=month))
    db.session.commit()
    print("     OK Volumes and issues seeded")


def seed_editorial_board():
    """Seed editorial board from the PDF content."""
    if EditorialMember.query.count() > 0:
        print("  -> Editorial board already seeded, skipping")
        return

    print("  -> Seeding editorial board...")
    members = [
        dict(name="Alain Pangop Cyr", role="Editor-in-Chief",
             institution="University of Yaounde I", country="Cameroon",
             specialization="Biological Sciences", email="editor@ijtd.com", display_order=0),
        dict(name="Clautaire Mwebi Ekengoue", role="Co-Editor-in-Chief",
             institution="University of Douala", country="Cameroon",
             specialization="Environmental Sciences", email="coeditor@ijtd.com", display_order=1),
        # Associate Editors
        dict(name="Dr. Amara Diallo", role="Associate Editor",
             institution="Universite Cheikh Anta Diop", country="Senegal",
             specialization="Pharmaceutical Sciences", display_order=10),
        dict(name="Prof. Ngozi Adeyemi", role="Associate Editor",
             institution="University of Lagos", country="Nigeria",
             specialization="Medical Sciences", display_order=11),
        dict(name="Dr. Samuel Kiprotich", role="Associate Editor",
             institution="University of Nairobi", country="Kenya",
             specialization="Agriculture & Life Sciences", display_order=12),
        dict(name="Dr. Fatima Boussaid", role="Associate Editor",
             institution="Universite Mohammed V", country="Morocco",
             specialization="Engineering & Technology", display_order=13),
        # Board Members
        dict(name="Prof. Jean-Pierre Mvondo", role="Editorial Board Member",
             institution="University of Buea", country="Cameroon",
             specialization="Human Sciences", display_order=20),
        dict(name="Dr. Aissatou Sow", role="Editorial Board Member",
             institution="UCAD Dakar", country="Senegal",
             specialization="Communication and Literature", display_order=21),
        dict(name="Prof. Emmanuel Okonkwo", role="Editorial Board Member",
             institution="University of Ibadan", country="Nigeria",
             specialization="Economic and Management Sciences", display_order=22),
        dict(name="Dr. Grace Muthoni", role="Editorial Board Member",
             institution="Kenyatta University", country="Kenya",
             specialization="Nursing and Health Sciences", display_order=23),
        dict(name="Prof. Ali Hassan", role="Editorial Board Member",
             institution="Cairo University", country="Egypt",
             specialization="Biological Sciences", display_order=24),
        dict(name="Dr. Marie-Claire Akoa", role="Editorial Board Member",
             institution="Institut Superieur du Sahel", country="Cameroon",
             specialization="Life Sciences", display_order=25),
    ]
    for m in members:
        db.session.add(EditorialMember(**m))
    db.session.commit()
    print(f"     OK {len(members)} editorial members seeded")


def seed_articles():
    """Seed sample published articles into Volume 1, Issues 1-5 (2026)."""
    if Article.query.count() > 0:
        print("  -> Articles already seeded, skipping")
        return

    print("  -> Seeding articles...")

    # Get Volume 1 Issues
    vol1   = Volume.query.filter_by(number=1).first()
    issue1 = Issue.query.filter_by(volume_id=vol1.id, number=1).first()
    issue2 = Issue.query.filter_by(volume_id=vol1.id, number=2).first()
    issue3 = Issue.query.filter_by(volume_id=vol1.id, number=3).first()
    issue4 = Issue.query.filter_by(volume_id=vol1.id, number=4).first()
    issue5 = Issue.query.filter_by(volume_id=vol1.id, number=5).first()

    base_date = datetime(2026, 1, 15, tzinfo=timezone.utc)

    articles = [
        # ── Issue 1 — January ─────────────────────────────────────────────
        dict(
            issue_id=issue1.id,
            title="Advances in Sustainable Agricultural Practices for Climate Resilience in Sub-Saharan Africa",
            abstract=(
                "Climate change poses severe threats to agricultural productivity in Sub-Saharan Africa. "
                "This study investigates sustainable agricultural practices that enhance climate resilience "
                "across diverse agro-ecological zones. Data were collected from 450 smallholder farmers in "
                "Cameroon, Nigeria, and Kenya using structured questionnaires and field experiments. Results "
                "indicate that integrated soil-water conservation techniques increased crop yields by 34% under "
                "drought conditions. Conservation tillage combined with cover cropping reduced soil erosion by "
                "61%. These findings provide actionable recommendations for policy-makers and development "
                "organizations seeking to strengthen food security in the region."
            ),
            keywords="sustainable agriculture, climate resilience, Sub-Saharan Africa, smallholder farmers, food security",
            authors="Kamga, P., Nwosu, C., Oluoch, J.",
            category="Research Article",
            doi="10.12345/ijtd.2026.001",
            status="published",
            views=312, downloads=87,
            published_at=base_date,
        ),
        dict(
            issue_id=issue1.id,
            title="Machine Learning Applications in Pharmaceutical Drug Discovery: A Systematic Review",
            abstract=(
                "The integration of machine learning (ML) into pharmaceutical drug discovery has revolutionized "
                "the identification of novel therapeutic compounds. This systematic review synthesizes findings "
                "from 120 peer-reviewed studies published between 2018 and 2025. Deep learning models, particularly "
                "graph neural networks and transformer architectures, demonstrated superior performance in "
                "molecular property prediction (AUC > 0.92) compared to classical methods. We discuss key "
                "challenges including data scarcity, model interpretability, and regulatory acceptance, and "
                "propose a framework for responsible ML integration in drug pipelines."
            ),
            keywords="machine learning, drug discovery, deep learning, molecular property prediction, pharmaceutical",
            authors="Mensah, A.K., Okonkwo, E.C.",
            category="Review Article",
            doi="10.12345/ijtd.2026.002",
            status="published",
            views=528, downloads=214,
            published_at=base_date + timedelta(days=5),
        ),
        dict(
            issue_id=issue1.id,
            title="Economic Implications of Digital Transformation in Emerging Economies: Evidence from Cameroon",
            abstract=(
                "Digital transformation is reshaping economic landscapes globally, yet its implications for "
                "emerging economies remain understudied. Using a mixed-methods approach combining a survey of "
                "280 enterprises and in-depth interviews with 30 business leaders in Cameroon, this study "
                "examines productivity gains, employment shifts, and inequality effects of digital adoption. "
                "Enterprises that fully digitalized core operations recorded an average productivity increase "
                "of 28%, while employment in routine-task occupations declined by 12%. Policy recommendations "
                "emphasize digital skills training and inclusive connectivity infrastructure."
            ),
            keywords="digital transformation, emerging economies, Cameroon, productivity, employment, inequality",
            authors="Dlamini, T.N., Adebayo, F.O., Chepkwony, R.K.",
            category="Research Article",
            doi="10.12345/ijtd.2026.003",
            status="published",
            views=201, downloads=63,
            published_at=base_date + timedelta(days=8),
        ),
        dict(
            issue_id=issue1.id,
            title="Novel Approaches to Water Purification Using Iron-Doped Nanomaterials",
            abstract=(
                "Access to clean water remains a global challenge. This short communication reports the "
                "synthesis of iron-doped titanium dioxide nanoparticles and their application in photocatalytic "
                "degradation of organic contaminants. Under visible-light irradiation, the synthesized nanocomposite "
                "achieved 94.7% degradation of methylene blue within 120 minutes. The material demonstrated "
                "excellent recyclability over five cycles with minimal efficiency loss. These results suggest "
                "a promising, low-cost water treatment solution suitable for rural settings in Africa."
            ),
            keywords="nanomaterials, water purification, photocatalysis, iron-doped TiO2, organic contaminants",
            authors="Osei, K.A., Mugisha, D.",
            category="Short Communication",
            doi="10.12345/ijtd.2026.004",
            status="published",
            views=145, downloads=49,
            published_at=base_date + timedelta(days=10),
        ),
        dict(
            issue_id=issue1.id,
            title="Traditional Medicine Integration in Modern Healthcare Systems: A Perspective from Central Africa",
            abstract=(
                "Traditional medicine practices are deeply embedded in Central African healthcare systems, "
                "with over 70% of the population relying on them as primary care. This perspective article "
                "examines the opportunities and challenges of integrating traditional medicine into formal "
                "healthcare frameworks. Drawing on literature and practitioner interviews, we identify regulatory "
                "gaps, safety concerns, and successful integration models from other regions. We argue for "
                "evidence-based validation of traditional remedies and propose a collaborative research agenda "
                "between biomedical and traditional practitioners."
            ),
            keywords="traditional medicine, healthcare integration, Central Africa, medical pluralism, evidence-based medicine",
            authors="Banda, M.C., Okafor, N.I.",
            category="Perspective Article",
            doi="10.12345/ijtd.2026.005",
            status="published",
            views=189, downloads=57,
            published_at=base_date + timedelta(days=12),
        ),
        # ── Issue 2 — February ────────────────────────────────────────────
        dict(
            issue_id=issue2.id,
            title="Biofortification Strategies for Combating Micronutrient Deficiency in Staple Crops",
            abstract=(
                "Micronutrient deficiency affects over 2 billion people worldwide, disproportionately in "
                "low-income countries. This review examines agronomic biofortification, conventional breeding, "
                "and biotechnological approaches to enhance micronutrient content in staple crops including "
                "maize, cassava, and sorghum. Results from field trials conducted across West and Central Africa "
                "demonstrate that zinc-biofortified maize varieties increased daily zinc intake by 38% in "
                "target populations. We discuss scalability, farmer adoption barriers, and regulatory pathways "
                "for biofortified crop varieties."
            ),
            keywords="biofortification, micronutrient deficiency, staple crops, zinc, cassava, maize",
            authors="Tchatchoua, R., Amara, I., Oluwaseun, B.",
            category="Review Article",
            doi="10.12345/ijtd.2026.006",
            status="published",
            views=97, downloads=31,
            published_at=datetime(2026, 2, 10, tzinfo=timezone.utc),
        ),
        dict(
            issue_id=issue2.id,
            title="Nurse Burnout in Sub-Saharan African Hospitals: Prevalence, Risk Factors, and Interventions",
            abstract=(
                "Nurse burnout threatens healthcare quality and workforce sustainability in Sub-Saharan Africa. "
                "This cross-sectional study assessed burnout prevalence among 620 nurses across five referral "
                "hospitals in Cameroon using the Maslach Burnout Inventory. Emotional exhaustion was reported "
                "by 61.3% of participants, with high workload and inadequate resources as primary predictors. "
                "Structural interventions including workload redistribution and peer support programs significantly "
                "reduced burnout scores. These findings inform urgent healthcare workforce management policies."
            ),
            keywords="nurse burnout, healthcare workforce, Sub-Saharan Africa, Maslach Burnout Inventory, intervention",
            authors="Nguetsop, V.F., Alade, T.B.",
            category="Research Article",
            doi="10.12345/ijtd.2026.007",
            status="published",
            views=134, downloads=52,
            published_at=datetime(2026, 2, 18, tzinfo=timezone.utc),
        ),
        # ── Issue 3 — March ───────────────────────────────────────────────
        dict(
            issue_id=issue3.id,
            title="Solar Energy Adoption in Rural Cameroon: Barriers, Drivers, and Policy Recommendations",
            abstract=(
                "Rural electrification through solar energy is critical for sustainable development in sub-Saharan "
                "Africa. This study employed a quantitative survey of 380 rural households and qualitative "
                "interviews with 25 policymakers to identify barriers and drivers of solar adoption in Cameroon. "
                "Financial constraints, limited awareness, and inadequate after-sales service were the primary "
                "barriers. Community-based financing models and targeted subsidies emerged as effective enablers. "
                "The study contributes original empirical evidence to the discourse on energy transition in "
                "developing nations."
            ),
            keywords="solar energy, rural electrification, Cameroon, energy poverty, renewable energy policy",
            authors="Fomba, C.M., Ibrahim, A.O., Ekwueme, D.U.",
            category="Research Article",
            doi="10.12345/ijtd.2026.008",
            status="published",
            views=76, downloads=24,
            published_at=datetime(2026, 3, 5, tzinfo=timezone.utc),
        ),
        # ── Issue 4 — April ───────────────────────────────────────────────
        dict(
            issue_id=issue4.id,
            title="CRISPR-Cas9 Gene Editing in Livestock: Prospects for Disease Resistance in African Cattle",
            abstract=(
                "Trypanosomiasis and East Coast Fever impose enormous economic burdens on African cattle "
                "producers. This review explores the application of CRISPR-Cas9 technology to enhance disease "
                "resistance in indigenous African cattle breeds. Recent advances in delivery systems including "
                "lipid nanoparticles and viral vectors have improved editing efficiency in bovine embryos. "
                "We discuss ethical frameworks, regulatory environments, and strategies for equitable access "
                "to gene-edited livestock technologies in Africa."
            ),
            keywords="CRISPR-Cas9, gene editing, cattle, disease resistance, trypanosomiasis, Africa",
            authors="Kamwi, J.M., Owino, A.P., Seck, M.",
            category="Topical Review",
            doi="10.12345/ijtd.2026.009",
            status="published",
            views=163, downloads=68,
            published_at=datetime(2026, 4, 12, tzinfo=timezone.utc),
        ),
        # ── Issue 5 — May (current) ───────────────────────────────────────
        dict(
            issue_id=issue5.id,
            title="Urban Food Systems and Nutrition Transition in Yaounde: A Mixed-Methods Study",
            abstract=(
                "Rapid urbanization in African cities is driving a nutrition transition characterized by "
                "increased consumption of processed foods and declining dietary diversity. This mixed-methods "
                "study examined food environments and dietary patterns among 500 urban households in Yaounde, "
                "Cameroon. Quantitative food frequency questionnaires were complemented by ethnographic "
                "observation of 12 markets. Results show a 43% increase in ultra-processed food consumption "
                "over the past decade, associated with higher rates of overweight and metabolic syndrome. "
                "Urban food policy interventions are urgently needed."
            ),
            keywords="urban food systems, nutrition transition, Yaounde, dietary diversity, processed foods",
            authors="Epie, M.N., Toure, F., Mwangi, P.K.",
            category="Research Article",
            doi="10.12345/ijtd.2026.010",
            status="published",
            views=44, downloads=13,
            published_at=datetime(2026, 5, 3, tzinfo=timezone.utc),
        ),
        # ── Accepted (in-progress) articles — no issue assigned yet ──────
        dict(
            issue_id=None,
            title="Antimicrobial Resistance Patterns in Clinical Isolates from Tertiary Hospitals in West Africa",
            abstract=(
                "Antimicrobial resistance (AMR) is a growing public health threat in West Africa, exacerbated "
                "by inadequate surveillance and antibiotic stewardship. This multi-centre study characterised "
                "AMR profiles of bacterial isolates from 1,200 patients at six tertiary hospitals in Ghana, "
                "Nigeria, and Senegal. Extended-spectrum beta-lactamase (ESBL)-producing Enterobacteriaceae "
                "were detected in 48% of isolates. Multidrug resistance was particularly prevalent in "
                "Klebsiella pneumoniae (71%). The findings underscore the urgent need for national AMR action "
                "plans and coordinated regional surveillance networks."
            ),
            keywords="antimicrobial resistance, West Africa, ESBL, bacterial isolates, antibiotic stewardship",
            authors="Kwakye-Nuako, G., Bello, O.S., Diedhiou, A.",
            category="Research Article",
            doi="10.12345/ijtd.2026.011",
            status="accepted",
            views=0, downloads=0,
            published_at=None,
        ),
        dict(
            issue_id=None,
            title="Fintech Innovation and Financial Inclusion in Francophone Africa: A Roadmap",
            abstract=(
                "Financial technology (fintech) presents unprecedented opportunities to extend financial "
                "services to the unbanked population of Francophone Africa. This roadmap article synthesizes "
                "evidence on mobile money adoption, regulatory frameworks, and digital credit markets across "
                "Cameroon, Cote d'Ivoire, Senegal, and the DRC. It maps current fintech ecosystems, identifies "
                "regulatory gaps, and outlines research priorities to guide policymakers, investors, and "
                "development practitioners over the next decade."
            ),
            keywords="fintech, financial inclusion, Francophone Africa, mobile money, digital credit",
            authors="Essomba, C., Coulibaly, M., Diallo, B.",
            category="Roadmap Article",
            doi="10.12345/ijtd.2026.012",
            status="accepted",
            views=0, downloads=0,
            published_at=None,
        ),
    ]

    for a_data in articles:
        db.session.add(Article(**a_data))
    db.session.commit()
    print(f"     OK {len(articles)} articles seeded")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        print("\nSeeding IJTD database...\n")
        db.create_all()
        seed_roles()
        seed_admin_user()
        seed_volumes()
        seed_editorial_board()
        seed_articles()
        print("\nSeeding complete!\n")