// stopp.js

// STOPP/START criteria for potentially inappropriate prescribing in older people, version 2: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4339726/
// Supplementary Data: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4339726/bin/supp_44_2_213__index.html

var MedicationClasses = {
	'beta-blockers': ["acebutolol","atenolol","betaxolol","bisoprolol","carvedilol","celiprolol","esmolol","labetalol","levobunolol","metoprolol","nadolol","nebivolol","phenoxybenzamine","pindolol","propranolol","sotolol","timolol"],
	'loop-diuretics': ["furosemide", "bumetanide", "torasemide"],
	'thiazide-diuretics': ["bendroflumethiazide","chlortalidone","xipamide","indapamide","metolazone","benzthiazide","clopamide","hydrochlorothiazide","hydroflumethiazide"],
	'ACEi': ["capropril","enalapril","fosinopril","imidapril","lisinopril","perindopril","quinapril","trandolapril"],
	'ARBs': ["Azilsartan","candesartan","eprosartan","irbesartan","losartan","olmesartan","telmisartan","valsartan"],
	'PDE5i': ["sildenafil","tadalafil","vardenafil"],
	'antiplatelets': ["aspirin","clopidogrel","dipyridamole","prasugrel","ticagrelor","cangrelor","eptifibatide","tirofiban","epoprostenol"],
	'vitamin-K-antagonists': ["warfarin","acenocoumarol","phenindione"],
	'direct-thrombin-inhibitors': ["argatroban","bivalirudin","dabigatran"],
	'factor-Xa-inhibitors': ["apixaban","edoxaban","fondaparinux","rivaroxaban"],
	'NSAIDs': ["aceclofenac","aspirin","celecoxib","dexibuprofen","dexketoprofen","diclofenac","etodolac","etoricoxib","flurbiprofen","ibuprofen","indometacin","ketoprofen","ketorolac","mefenamic","meloxicam","nabumetone","naproxen","parecoxib","piroxicam","sulindac","tenoxicam","tiaprofenic","tolfenamic"],
	'tricyclic-antidepressants': ["amitriptyline","clomipramine","dosulepin","doxepin","mianserin","trazodone","trimipramine","imipramine","lofepramine","nortriptyline"],
	'benzodiazepines': ["diazepam","alprazolam","clobazam","clonazepam","flurazepam","chlordiazepoxide","loprazolam","lorazepam","lormetazepam","nitrazepam","oxazepam","temazepam"],
};

var STOPP = {
	'digoxin': {
		'txt': 'Digoxin for heart failure with preserved systolic ventricular function (no clear evidence of benefit)',
		'refs':
			[{
				'ref': 'Jessup M, Abraham WT, Casey DE, Feldman AM, Francis GS, Ganiats TG, Konstam MA, Mancini DM, Rahko PS, Silver MA, Stevenson LW, Yancy CW. 2009 focused update: ACCF/AHA Guidelines for the Diagnosis and Management of Heart Failure in Adults:a report of the American College of Cardiology Foundation/American Heart Association Task Force on Practice Guidelines: developed in collaboration with the International Society for Heart and Lung Transplantation. Circulation 2009; 119(14): 1977-2016. PubMed PMID: 19324967',
				'PMID': '19324967'
			},{
				'ref': 'Cheng JW, Nayar M. A review of heart failure management in the elderly population.  Am J Geriatr Pharmacother 2009; 7(5): 233-49. Review. PubMed PMID: 19948300',
				'PMID': '119948300'
			}]
	},
	'verapamil|diltiazem': {
		'txt': 'Verapamil or diltiazem with NYHA Class III or IV heart failure (may worsen heart failure).',
		'refs':
			[{
				'ref': 'Amabile CM, Spencer AP. Keeping your patient with heart failure safe: a review of potentially dangerous medications. Arch Intern Med 2004; 164(7): 709-20. Review. PubMed PMID:15078640',
				'PMID': '15078640'
			},
			{
				'ref': 'Opie LH, Yusuf S, Kübler W. Current status of safety and efficacy of calcium channel blockers in cardiovascular diseases: a critical analysis based on 100 studies. Prog Cardiovasc Dis 2000; 43(2): 171-96. Review. PubMed PMID:11014332',
				'PMID': '11014332'
			}]
	},
	'beta-blockers|verapamil|diltiazem': {
		'txt': 'Beta-blocker in combination with verapamil or diltiazem (risk of heart block)',
		'refs':
			[{
				'ref': 'Lee DW, Cohan B. Refractory cardiogenic shock and complete heart block after verapamil SR and metoprolol treatment. A case report. Angiology 1995; 46(6): 517-9. Review. PubMed PMID: 7785794',
				'PMID': '7785794'
			},{
				'ref': 'Edoute Y, Nagachandran P, Svirski B, Ben-Ami H. Cardiovascular adverse drug reaction associated with combined beta-adrenergic and calcium entry-blocking agents. J Cardiovasc Pharmacol 2000; 35(4): 556-9. PubMed PMID: 10774785',
				'PMID': '10774785'
			}]
	},
	'beta-blockers': {
		'txt': 'Beta blocker with symptomatic bradycardia (< 50/min), type II heart block or complete heart block (risk of profound hypotension, asystole).',
		'refs': 
			[{
				'ref':	'BNF',
				'URL': 'somewhere'
			}]		
	},
	'amiodarone': {
		'txt': 'Amiodarone as first-line antiarrhythmic therapy in supraventricular tachyarrhythmias (higher risk of side-effects than beta-blockers, digoxin, verapamil or diltiazem)',
		'refs':
			[{
				'ref': 'Lafuente-Lafuente C, Mouly S, Longás-Tejero MA, Mahé I, Bergmann JF. Antiarrhythmic drugs for maintaining sinus rhythm after cardioversion of atrial fibrillation: a systematic review of randomized controlled trials. Arch Intern Med 2006; 166(7):719-28. Review. PubMed PMID: 16606807',
				'PMID': '16606807'
			},{
				'ref': 'Piccini JP, Berger JS, O\'Connor CM. Amiodarone for the prevention of sudden cardiac death: a meta-analysis of randomized controlled trials. Eur Heart J 2009; 30(10):1245-53. Review. PubMed PMID: 19336434',
				'PMID': '19336434'
			}]
	},
	'loop-diuretics|1': {
		'txt': 'Loop diuretic as first-line treatment for hypertension (lack of outcome data for this indication; safer, more effective alternatives available).',
		'refs':
			[{
				'ref': 'Sica DA, Carter B, Cushman W, Hamm L. Thiazide and loop diuretics. J Clin Hypertens (Greenwich) 2011; 13(9): 639-43. Review. PubMed PMID: 21896142',
				'PMID': '21896142'
			},{
				'ref': 'Williams B, Poulter NR, Brown MJ, Davis M, McInnes GT, Potter JF, Sever PS, Thom SM; BHS guidelines working party, for the British Hypertension Society. British Hypertension Society guidelines for hypertension management 2004(BHS-IV): summary. BMJ 2004; 328(7440):634-40. Erratum in: BMJ 2004; 328(7445):926. PubMed PMID: 15016698',
				'PMID': '15016698'
			}]
	},
	'loop-diuretics|2': {
		'txt': 'Loop diuretic for dependent ankle oedema without clinical, biochemical evidence or radiological evidence of heart failure, liver failure, nephrotic syndrome or renal failure (leg elevation and /or compression hosiery usually more appropriate).',
		'refs':
			[{
				'ref': 'Wehling M. Morbus diureticus in the elderly: epidemic overuse of a widely applied group of drugs. J Am Med Dir Assoc 2013; 14(6): 437-42. Review. PubMed PMID: 23510827',
				'PMID': '23510827'
			},{
				'ref': 'Sarafidis PA, Georgianos PI, Lasaridis AN. Diuretics in clinical practice. Part I: mechanisms of action, pharmacological effects and clinical indications of diuretic compounds. Expert Opin Drug Saf 2010; 9(2):243-57. Review. PubMed PMID: 20095917',
				'PMID': '20095917'
			}]
		
	},
	'thiazide-diuretics|1': {
		'txt': 'Thiazide diuretic with current significant hypokalaemia (i.e. serum K+ < 3.0 mmol/l), hyponatraemia (i.e. serum Na+ < 130 mmol/l) hypercalcaemia (i.e. corrected serum calcium > 2.65 mmol/l) or with a history of gout (hypokalaemia, hyponatraemia, hypercalcaemia and gout can be precipitated by thiazide diuretic)',
		'refs':
			[{
				'ref': 'Sica DA, Carter B, Cushman W, Hamm L. Thiazide and loop diuretics. J Clin Hypertens (Greenwich) 2011; 13(9):639-43. Review. PubMed PMID: 21896142',
				'PMID': '21896142'
			},{
				'ref': 'Gurwitz JH, Kalish SC, Bohn RL, Glynn RJ, Monane M, Mogun H, Avorn J. Thiazide diuretics and the initiation of anti-gout therapy. J ClinEpidemiol1997; 50(8): 953-9. PubMed PMID: 9291881',
				'PMID': '9291881'
			}]
	},
	'loop-diuretics|3': {
		'txt': 'Loop diuretic for treatment of hypertension with concurrent urinary incontinence (may exacerbate incontinence).',
		'refs':
			[{
				'ref': 'Ekundayo OJ. The association between overactive bladder and diuretic use in the elderly. Curr Urol Rep 2009; 10(6):434-40. Review. PubMed PMID: 19863854',
				'PMID': '19863854'
			},{
				'ref': 'Ekundayo OJ, Markland A, Lefante C, Sui X, Goode PS, Allman RM, Ali M, Wahle C, Thornton PL, Ahmed A. Association of diuretic use and overactive bladder syndrome in older adults: a propensity score analysis. Arch Gerontol Geriatr2009; 49(1):64-8. PubMed PMID: 18752858',
				'PMID': '18752858'
			},{
				'ref': 'Finkelstein MM. Medical conditions, medications, and urinary incontinence. Analysis of a population-based survey. Can Fam Physician 2002; 48:96-101.PubMed PMID: 11852617',
				'PMID': '11852617'
			}]
	},
	'methyldopa|clonidine|moxonidine|rilmenidine|guanfacine': {
		'txt': 'Centrally-acting antihypertensives (e.g. methyldopa, clonidine, moxonidine, rilmenidine, guanfacine), unless clear intolerance of, or lack of efficacy with, other classes of antihypertensives (centrally-active antihypertensives are generally less well tolerated by older people than younger people)',
		'refs':
			[{
				'ref': 'Potter JF. Hypertension. In: Brocklehurst’s Textbook of Geriatric Medicine & Gerontology, 6th edition, Churchill Livingstone, 2003, p403'
			},{
				'ref': 'Khindri S, Jackson S. Hypertension. In: Prescribing for Elderly Patients, S. Jackson, P. Jansen, A. Mangoni, eds., Wiley-Blackwell, Chichester, UK, 2009, pp97-98'
			}]
	},
	'ACEi|ARBs|1': {
		'txt': 'ACE inhibitors or Angiotensin Receptor Blockers in patients with hyperkalaemia',
		'refs': 
			[{
				'ref': 'Izzo JL Jr, Weir MR. Angiotensin-converting enzyme inhibitors. J Clin Hypertens (Greenwich) 2011; 13(9):667-75. Review. PubMed PMID: 21896148',
				'PMID': '21896148'		
			},{
				'ref': 'Desai AS, Swedberg K, McMurray JJ, Granger CB, Yusuf S, Young JB, Dunlap ME, Solomon SD, Hainer JW, Olofsson B, Michelson EL, Pfeffer MA; CHARM Program Investigators. Incidence and predictors of hyperkalemia in patients with heart failure: an analysis of the CHARM Program. J Am Coll Cardiol 2007 Nov 13;50(20):1959-66. PubMed PMID: 17996561',
				'PMID': '17996561'
			},{
				'ref': 'Reardon LC, Macpherson DS. Hyperkalemia in outpatients using angiotensin-converting enzyme inhibitors. How much should we worry? Arch Intern Med 1998; 158(1):26-32. PubMed PMID: 9437375',
				'PMID': '9437375'
			}]
	},
	'spironolactone|eplerenone|ACEi|ARBs|amiloride|triamterene"': {
		'txt': 'Aldosterone antagonists (e.g. spironolactone, eplerenone) with concurrent potassium-conserving drugs (e.g. ACEI’s, ARB’s, amiloride, triamterene) without monitoring of serum potassium (risk of dangerous hyperkalaemia i.e. > 6.0 mmol/l – serum K should be monitored regularly, i.e. at least every 6 months).',
		'refs':
			[{
				'ref': 'Bauersachs J, Fraccarollo D. Aldosterone antagonism in addition to angiotensin-converting enzyme inhibitors in heart failure. Minerva Cardioangiol 2003; 51(2):155-64. Review. PubMed PMID: 12783071',
				'PMID': '12783071'
			},{
				'ref': 'Poggio R, Grancelli HO, Miriuka SG. Understanding the risk of hyperkalaemia in heart failure: role of aldosterone antagonism. Postgrad Med J 2010; 86 (1013):136-42. Review. PubMed PMID: 20237007',
				'PMID': '20237007'
			},{
				'ref': 'Wrenger E, Müller R, Moesenthin M, Welte T, Frölich JC, Neumann KH. Interaction of spironolactone with ACE inhibitors or angiotensin receptor blockers: analysis of 44 cases. BMJ 2003; 327(7407):147-9. PubMed PMID: 12869459',
				'PMID': '12869459'
			},{
				'ref': 'Marcy TR, Ripley TL. Aldosterone antagonists in the treatment of heart failure. Am J Health Syst Pharm 2006; 63(1): 49-58. PubMed PMID: 16373465',
				'PMID': '16373465'
			},{
				'ref': 'Tang WH, Parameswaran AC, Maroo AP, Francis GS. Aldosterone receptor antagonists in the medical management of chronic heart failure. Mayo Clin Proc 2005; 80(12): 1623-30. Review. PubMed PMID: 16342656',
				'PMID': '16342656'
			}]
	},
	'PDE5i|1': {
		'txt': 'Phosphodiesterase type-5 inhibitors (e.g. sildenafil, tadalafil, vardenafil) in severe heart failure characterised by hypotension i.e. systolic BP < 90 mmHg, or concurrent daily nitrate therapy for angina (risk of cardiovascular collapse)',
		'refs':
			[{
				'ref': 'British National Formulary, No. 61, March 2011, p516'
			},{
				'ref': 'Kloner RA, Hutter AM, Emmick JT, Mitchell MI, Denne J, Jackson G. Time course of the interaction between tadalafil and nitrates. J Am Coll Cardiol 2003; 42 (10): 1855-60. PubMed PMID: 14642699',
				'PMID': '14642699'
			}]
	},
	'aspirin|1': {
		'txt': 'Long-term aspirin at doses greater than 160mg per day (increased risk of bleeding, no evidence for increased efficacy).',
		'refs':
			[{
				'ref': 'Dalen JE. Aspirin to prevent heart attack and stroke: what is the right dose? Am J Med 2006; 119(3):198-202. Review. PubMed PMID: 16490462',
				'PMID': '16490462'
			},{
				'ref': 'Fisher M, Knappertz V. The dose of aspirin for the prevention of cardiovascular and cerebrovascular events. Curr Med Res Opin 2006; 22(7):1239-48. Review. PubMed PMID: 16892516',
				'PMID': '16892516'
			}]
	},
	'aspirin|2': {
		'txt': 'Aspirin with a past history of peptic ulcer disease without concomitant PPI (risk of recurrent peptic ulcer)',
		'refs':
			[{
				'ref': 'Yeomans ND. Reducing the risk of gastroduodenal ulcers with a fixed combination of esomeprazole and low-dose acetyl salicylic acid. Expert Rev Gastroenterol Hepatol 2011; 5(4):447-55. Review. PubMed PMID: 21780891',
				'PMID': '21780891'
			},{
				'ref': 'Burness CB, Scott LJ. Acetylsalicylic acid/esomeprazole fixed-dose combination. Drugs Aging 2012; 29(3):233-42. Review. PubMed PMID: 22372726',
				'PMID': '22372726'
			},{
				'ref': 'Lanas A. Gastrointestinal bleeding associated with low-dose aspirin use: relevance and management in clinical practice. Expert Opin Drug Saf 2011; 10(1):45-54. Review. PubMed PMID: 20645883',
				'PMID': '20645883'
			}]
	},
	'aspirin|clopidogrel|dipyridamole|vitamin-K-antagonists|direct-thrombin-inhibitors|factor-Xa-inhibitors': {
		'txt': 'Aspirin, clopidogrel, dipyridamole, vitamin K antagonists, direct thrombin inhibitors or factor Xa inhibitors with concurrent significant bleeding risk, i.e. uncontrolled severe hypertension, bleeding diathesis, recent non-trivial spontaneous bleeding) (high risk of bleeding).',
		'refs':
			[{
				'ref': 'Lip GY. Implications of the CHA(2)DS(2)-VASc and HAS-BLED Scores for thromboprophylaxis in atrial fibrillation. Am J Med. 2011; 124(2):111-4. PubMed PMID: 20887966',
				'PMID': '20887966'
			},{
				'ref': 'Pisters R, Lane DA, Nieuwlaat R, de Vos CB, Crijns HJ, Lip GY. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation: the Euro Heart Survey. Chest 2010; 138(5):1093-100. PubMed PMID: 20299623',
				'PMID': '20299623'
			}]
	},
	'aspirin|clopidogrel': {
		'txt': 'Aspirin plus clopidogrel as secondary stroke prevention, unless the patient has a coronary stent(s) inserted in the previous 12 months or concurrent acute coronary syndrome or has a high grade symptomatic carotid arterial stenosis (no evidence of added benefit over clopidogrel monotherapy)',
		'refs':
			[{
				'ref': 'Diener HC, Bogousslavsky J, Brass LM, Cimminiello C, Csiba L, Kaste M, Leys D, Matias-Guiu J, Rupprecht HJ; MATCH investigators. Aspirin and clopidogrel compared with clopidogrel alone after recent ischaemic stroke or transient ischaemic attack in high-risk patients (MATCH): randomised, double-blind, placebo-controlled trial. Lancet 2004; 364(9431):331-7. PubMed PMID: 15276392',
				'PMID': '15276392'
			},{
				'ref': 'Bhatt DL, Fox KA, Hacke W, Berger PB, Black HR, Boden WE, Cacoub P, Cohen EA, Creager MA, Easton JD, Flather MD, Haffner SM, Hamm CW, Hankey GJ, Johnston SC, Mak KH, Mas JL, Montalescot G, Pearson TA, Steg PG, Steinhubl SR, Weber MA, Brennan DM, Fabry-Ribaudo L, Booth J, Topol EJ; CHARISMA Investigators. Clopidogrel and aspirin versus aspirin alone for the prevention of atherothrombotic events. N Engl J Med. 2006; 354(16):1706-17. PubMed PMID: 16531616',
				'PMID': '16531616'
			},{
				'ref': 'Usman MH, Notaro LA, Nagarakanti R, Brahin E, Dessain S, Gracely E, Ezekowitz MD. Combination antiplatelet therapy for secondary stroke prevention: enhanced efficacy or double trouble? Am J Cardiol 2009;103(8):1107-12. Review. PubMed PMID: 19361598',
				'PMID': '19361598'
			},{
				'ref': 'Squizzato A, Keller T, Romualdi E, Middeldorp S. Clopidogrel plus aspirin versus aspirin alone for preventing cardiovascular disease. Cochrane Database Syst Rev 2011;(1):CD005158. Review. PubMed PMID: 21249668',
				'PMID': '21249668'
			},{
				'ref': 'Fares RR, Lansing LS, Gallati CA, Mousa SA. Antiplatelet therapy with clopidogrel and aspirin in vascular diseases: clinical evidence for and against the combination. Expert Opin Pharmacother 2008; 9(3): 377-86. Review. PubMed PMID: 18220489',
				'PMID': '18220489'
			}]
	},
	'aspirin|3': {
		'txt': 'Aspirin in combination with vitamin K antagonist, direct thrombin inhibitor or factor Xa inhibitors in patients with chronic atrial fibrillation without a clear indication for aspirin (no added benefit from aspirin)',
		'refs':
			[{
				'ref': 'Flaker GC, Gruber M, Connolly SJ, Goldman S, Chaparro S, Vahanian A, Halinen MO, Horrow J, Halperin JL; SPORTIF Investigators. Risks and benefits of combining aspirin with anticoagulant therapy in patients with atrial fibrillation: an exploratory analysis of stroke prevention using an oral thrombin inhibitor in atrial fibrillation (SPORTIF) trials. Am Heart J 2006; 152(5):967-73. PubMed PMID: 17070169',
				'PMID': '17070169'
			},{
				'ref': 'Larson RJ, Fisher ES. Should aspirin be continued in patients started on warfarin? J Gen Intern Med 2004; 19(8):879-86. Review. PubMed Central PMCID: PMC1492499'
			}]
	},
	'antiplatelets|vitamin-K-antagonists|direct-thrombin-inhibitors|factor-Xa-inhibitors': {
		'txt': 'Antiplatelet agents with vitamin K antagonist, direct thrombin inhibitor or factor Xa inhibitors in patients with stable coronary, cerebrovascular or peripheral arterial disease without a clear indication for anticoagulant therapy  (no added benefit from dual therapy).',
		'refs':
			[{
				'ref': 'Holmes DR Jr, Kereiakes DJ, Kleiman NS, Moliterno DJ, Patti G, Grines CL. Combining antiplatelet and anticoagulant therapies. J Am Coll Cardiol 2009; 54(2):95-109. Review. PubMed PMID: 19573725',
				'PMID': '19573725'
			},{
				'ref': 'Rubboli A, Halperin JL, Airaksinen KE, Buerke M, Eeckhout E, Freedman SB, Gershlick AH, Schlitt A, Tse HF, Verheugt FW, Lip GY. Antithrombotic therapy in patients treated with oral anticoagulation undergoing coronary artery stenting. An expert consensus document with focus on atrial fibrillation. Ann Med 2008; 40(6):428-36. Review. PubMed PMID: 18608125',
				'PMID': '18608125'
			}]
	},
	'ticlopidine': {
		'txt': 'Ticlopidine in any circumstances (clopidogrel and prasugrel have similar efficacy, stronger evidence and fewer side-effects).',
		'refs':
			[{
				'ref': 'Furie KL, Kasner SE, Adams RJ, Albers GW, Bush RL, Fagan SC, Halperin JL, Johnston SC, Katzan I, Kernan WN, Mitchell PH, Ovbiagele B, Palesch YY, Sacco RL, Schwamm LH, Wassertheil-Smoller S, Turan TN, Wentworth D; American Heart Association Stroke Council, Council on Cardiovascular Nursing, Council on Clinical Cardiology, and Interdisciplinary Council on Quality of Care and Outcomes Research. Guidelines for the prevention of stroke in patients with stroke or transient ischemic attack: a guideline for healthcare professionals from the American heart association/American stroke association. Stroke 2011; 42(1):227-76. PubMed PMID: 20966421',
				'PMID': '20966421'
			},{
				'ref': 'Porto I, Giubilato S, De Maria GL, Biasucci LM, Crea F. Platelet P2Y12 receptor inhibition by thienopyridines: status and future. Expert Opin Investig Drugs 2009; 18(9):1317-32. Review. PubMed PMID: 19678800',
				'PMID': '19678800'
			}]
	},
	'vitamin-K-antagonists|direct-thrombin-inhibitors|factor-Xa-inhibitors|1': {
		'txt': 'Vitamin K antagonist, direct thrombin inhibitor or factor Xa inhibitors for first deep venous thrombosis without continuing provoking risk factors for > 6 months, (no proven added benefit).',
		'refs':
			[{
				'ref': 'Pinede L, Ninet J, Duhaut P, Chabaud S, Demolombe-Rague S, Durieu I, Nony P, Sanson C, Boissel JP; Investigators of the "Durée Optimale du Traitement AntiVitamines K" (DOTAVK) Study. Comparison of 3 and 6 months of oral anticoagulant therapy after a first episode of proximal deep vein thrombosis or pulmonary embolism and comparison of 6 and 12 weeks of therapy after isolated calf deep vein thrombosis. Circulation 2001; 103(20): 2453-60. PubMed PMID: 11369685',
				'PMID': '11369685'
			},{
				'ref': 'Kearon C, Akl EA, Comerota AJ, Prandoni P, Bounameaux H, Goldhaber SZ, Nelson ME, Wells PS, Gould MK, Dentali F, Crowther M, Kahn SR; American College of Chest Physicians. Antithrombotic therapy for VTE disease: Antithrombotic Therapy and Prevention of Thrombosis, 9th ed: American College of Chest Physicians Evidence-Based Clinical Practice Guidelines. Chest 2012; 141(2 Suppl): e419S-94S. PubMed PMID: 22315268',
				'PMID': '22315268'
			}]
	},
	'vitamin-K-antagonists|direct-thrombin-inhibitors|factor-Xa-inhibitors|2': {
		'txt': 'Vitamin K antagonist, direct thrombin inhibitor or factor Xa inhibitors for first pulmonary embolus without continuing provoking risk factors for > 12 months (no proven added benefit).',
		'refs':
			[{
				'ref': 'Kearon C, Akl EA, Comerota AJ, Prandoni P, Bounameaux H, Goldhaber SZ, Nelson ME, Wells PS, Gould MK, Dentali F, Crowther M, Kahn SR; American College of Chest Physicians. Antithrombotic therapy for VTE disease: Antithrombotic Therapy and Prevention of Thrombosis, 9th ed: American College of Chest Physicians Evidence-Based Clinical Practice Guidelines. Chest 2012; 141(2 Suppl): e419S-94S. PubMed PMID: 22315268; PubMed Central PMCID: PMC3278049',
				'PMID': '22315268'
			}]
	},
	'NSAIDs|vitamin-K-antagonists|direct-thrombin-inhibitors|factor-Xa-inhibitors': {
		'txt': 'NSAID and vitamin K antagonist, direct thrombin inhibitor or factor Xa inhibitors in combination (risk of gastrointestinal bleeding).',
		'refs':
			[{
				'ref': 'Knijff-Dutmer EA, Van der Palen J, Schut G, Van de Laar MA. The influence of cyclo-oxygenase specificity of non-steroidal anti-inflammatory drugs on bleeding complications in concomitant coumarine users. QJM 2003; 96(7):513-20. PubMed PMID: 12881594',
				'PMID': '12881594'
			},{
				'ref': 'Peng S, Duggan A. Gastrointestinal adverse effects of non-steroidal anti-inflammatory drugs. Expert Opin Drug Saf 2005; 4(2):157-69. Review. PubMed PMID: 15794710',
				'PMID': '15794710'
			}]
	},
	'NSAIDs|antiplatelet': {
		'txt': 'NSAID with concurrent antiplatelet agent(s) without PPI prophylaxis (increased risk of peptic ulcer disease)',
		'refs':
			[{
				'ref': 'Lanza FL, Chan FK, Quigley EM; Practice Parameters Committee of the American College of Gastroenterology. Guidelines for prevention of NSAID-related ulcer complications. Am J Gastroenterol 2009; 104(3):728-38. PubMed PMID: 19240698',
				'PMID': '19240698'
			},{
				'ref': 'Nardulli G, Lanas A. [Risk of gastrointestinal bleeding with aspirin and platelet antiaggregants]. Gastroenterol Hepatol 2009; 32(1):36-43. Review. Spanish. PubMed PMID: 19174098',
				'PMID': '19174098'
			},{
				'ref': 'Zullo A, Hassan C, Campo SM, Morini S. Bleeding peptic ulcer in the elderly-risk factors and prevention strategies. Drugs Aging 2007; 24(10): 815-28. Review. PubMed PMID: 17896831',
				'PMID': '17896831'
			}]
	},
	'tricyclic-antidepressants|1': {
		'txt': 'Tricyclic antidepressants with dementia, narrow angle glaucoma, cardiac conduction abnormalities, prostatism, or prior history of urinary retention (risk of worsening these conditions)',
		'refs':
			[{
				'ref': 'Tricyclic and related antidepressant drugs. British National Formulary, No. 61, BMJ Group & Pharmaceutical Press, March 2011, p233',
			},{
				'ref': 'Mintzer J, Burns A. Anticholinergic side-effects of drugs in elderly people. J R Soc Med 2000; 93 (9):457-62. Review. PubMed PMID: 11089480',
				'PMID': '11089480'
			},{
				'ref': 'Verhamme KM, Sturkenboom MC, Stricker BH, Bosch R. Drug-induced urinary retention: incidence, management and prevention. Drug Saf 2008; 31(5):373-88. Review. PubMed PMID: 18422378',
				'PMID': '18422378'
			},{
				'ref': 'Vieweg WV, Wood MA, Fernandez A, Beatty-Brooks M, Hasnain M, Pandurangi AK. Proarrhythmic risk with antipsychotic and antidepressant drugs: implications in the elderly. Drugs Aging 2009; 26(12): 997-1012. Review. PubMed PMID: 19929028',
				'PMID': '19929028'
			},{
				'ref': 'Tripathi RC, Tripathi BJ, Haggerty C. Drug-induced glaucomas: mechanism and management. Drug Saf 2003; 26(11): 749-67. Review. PubMed PMID: 12908846',
				'PMID': '12908846'
			}]
	},
	'tricyclic-antidepressants|2': {
		'txt': 'Initiation of tricyclic antidepressants as first-line antidepressant treatment (higher risk of adverse drug reactions with TCAs than with SSRIs or SNRIs).',
		'refs':
			[{
				'ref': 'Emslie G, Judge R. Tricyclic antidepressants and selective serotonin reuptake inhibitors: use during pregnancy, in children/adolescents and in the elderly. Acta Psychiatr Scand Suppl. 2000; 403: 26-34. Review. PubMed PMID: 11019932',
				'PMID': '11019932'
			},{
				'ref': 'Mottram P, Wilson K, Strobl J. Antidepressants for depressed elderly. Cochrane Database Syst Rev 2006 Jan 25; (1):CD003491. Review. PubMed PMID: 16437456',
				'PMID': '16437456'
			}]
	},
	'chlorpromazine|clozapine|flupenthixol|fluphenzine|pipothiazine|promazine|zuclopenthixol': {
		'txt': 'Neuroleptics with moderate-marked antimuscarinic/anticholinergic effects (chlorpromazine, clozapine, flupenthixol, fluphenzine, pipothiazine, promazine, zuclopenthixol) with a history of prostatism or previous urinary retention (high risk of urinary retention)',
		'refs':
			[{
				'ref': 'Verhamme KM, Sturkenboom MC, Stricker BH, Bosch R. Drug-induced urinary retention: incidence, management and prevention. Drug Saf 2008; 31(5):373-88.Review. PubMed PMID: 18422378',
				'PMID': '18422378'
			}]
	},
	'SSRIs|1': {
		'txt': 'Selective serotonin re-uptake inhibitors (SSRI’s) with current or recent significant hyponatraemia i.e. serum Na+ < 130 mmol/l (risk of exacerbating or precipitating hyponatraemia).',
		'refs':
			[{
				'ref': 'Jacob S, Spinler SA. Hyponatremia associated with selective serotonin-reuptake inhibitors in older adults. Ann Pharmacother 2006; 40(9):1618-22. Review. PubMed PMID: 16896026',
				'PMID': '16896026'
			},{
				'ref': 'Draper B, Berman K. Tolerability of selective serotonin reuptake inhibitors: issues relevant to the elderly. Drugs Aging 2008; 25(6): 501-19. Review. PubMed PMID: 18540689',
				'PMID': '18540689'
			}]
	},
	'benzodiazepines|1': {
		'txt': 'Benzodiazepines for ≥ 4 weeks (no indication for longer treatment; risk of prolonged sedation, confusion, impaired balance, falls, road traffic accidents; all benzodiazepines should be withdrawn gradually if taken for > 2 weeks as there is a risk of causing a benzodiazepine withdrawal syndrome if stopped abruptly)',
		'refs':
			[{
				'ref': 'Madhusoodanan S, Bogunovic OJ. Safety of benzodiazepines in the geriatric population. Expert Opin Drug Saf 2004; 3(5): 485-93. Review. PubMed PMID:15335303',
				'PMID': '15335303'
			},{
				'ref': 'Glass J, Lanctôt KL, Herrmann N, Sproule BA, Busto UE. Sedative hypnotics inolder people with insomnia: meta-analysis of risks and benefits. BMJ 2005; 331(7526): 1169. Review. PubMed PMID: 16284208',
				'PMID': '16284208'
			},{
				'ref': 'Barker MJ, Greenwood KM, Jackson M, Crowe SF. Cognitive effects of long-term benzodiazepine use: a meta-analysis. CNS Drugs 2004; 18(1):37-48. PubMed PMID: 14731058',
				'PMID': '14731058'
			}]
	}
	// D6
}



