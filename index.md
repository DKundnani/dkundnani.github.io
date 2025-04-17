## Biography

<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ZKYQ2F24J1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-ZKYQ2F24J1');
</script>
<br>
I work at the intersection of  <b> biology</b>,<b> statistics</b>, and <b>computation</b> at Georgia Institute of Technology as a Bioinformatics Ph.D. Candidate, specializing in multi-omics integration and association. My work includes investigation of ribonucleotide in [human nuclear](https://research.gatech.edu/new-grants-could-transform-scientists-understanding-dna) and [mitochondrial genome](https://academic.oup.com/nar/article/52/3/1207/7481827), [Aicardi-Goutières syndrome (AGS)](https://www.cell.com/iscience/fulltext/S2589-0042(24)01237-9), and expression correlation of [RNaseH2 subunits in cancer progression] (https://www.mdpi.com/2079-7737/10/3/221). 
<br><br>
Before coming to Georgia Tech, I have been fortunate to work with amazing doctors and scientists at Hanash Lab in [MD Anderson Cancer Center](https://www.mdanderson.org/newsroom/study-shows-biomarker-panel-boosts-lung-cancer-risk-assessment-for-smokers.h00-159225723.html) and have been a part of incredible effort in diagnostics of [Lung Cancer Risk Assessment Biomarkers](https://www.mdanderson.org/newsroom/study-shows-biomarker-panel-boosts-lung-cancer-risk-assessment-for-smokers.h00-159225723.html). 
---

## Recent Projects
### [Ribonucleotide enrichment features in human genome](/images/human_ribome_2025.PNG )
<br>
<img src="images\human_ribome_2025.PNG?raw=true"/>
<br><br>
Study of ribonucleotide embedment in human CD4+T cell type derived from patient blood and lab grown stem cell line (hESC-H9) and embryonic kidney cells (HEK293T), the latter with and without RNase H2 enzyme. In this study we discovered single embedded ribonucleotides (rNMPs) are enriched near CpG islands and are associated with gene expression and methylation around Transcription Start Sites (TSSs). In addition, we see a gene template vs non-template strand bias for RNase H2 KO that is not present in wild-type RNase H2 cell associated with removal of rG on non-template strand, possibly by Top1 enzyme.

---
### [Ribonucleotide features in Aicardi-Goutières syndrome (AGS) orthologous mutants ](/images/Exp-Corr-2021.jpg )
<br>
<img src="images\AGS_final.PNG?raw=true"/>
<br><br>
Two mutant orthologs of human AGS, namely RNaseH2A-G37S and RNaseH2C-R69W were experimentally created in yeast as rnh201-G32S and rnh203-K46W, respectively. The RNaseH2A mutant results in strong reduction of enzymes activity thereby leading to massive ribonucleotide increament in the nuclear genome with increase seen on leading strand of Autonomous Replicating Sequences. The RNase H2C mutant was found to show no significant increase in nuclear genome, but we observed change in sites of ribonucleotide embedment suggesting structural effect of enzyme leading to change in specificity.

---
### [Associations of RNASEH2A gene in cancer datasets](/images/Exp-Corr-2021.jpg )
<br>
<img src="images\Exp-Corr-2021.jpg?raw=true"/>
<br><br>
Determining Expression correlation of RNASEH2A with cancer proliferation and cell cycle markers in large cancer cell lines and tissue datasets. This project has been recently a part of [paper](https://doi.org/10.3390/biology10030221) published in MDPI's Biology journal and received US National Science Foundation Conference Award for a [poster presentation](/pdf/GT_BINF_Poster_2021_DK.pdf) in [RNA 2021 Conference](https://app.oxfordabstracts.com/events/1864/program-app/submission/243452)

---

### [Application to Determine Susceptibility of Multiple infections](/images/IGen-2020.jpg)
<br>
<img src="images\IGen-2020.jpg?raw=true"/>
<br><br>
IGen is an app to help the consumer be aware of their genetic tendency for susceptibility to multiple infections and be proactive with their health during the time of Global Pandemic. All they need is a DNA test sequencing Results from Companies like 23andMe.[  [Glimpse of the Science behind it](/ppt/IGen.pptx) ]

---
### [Use of Methylation data to determine Survial Risks in HIV cohort from Yale's Veterans Aging Cohort Study](/images/DMR-2020.jpg )
<br>
<img src="images\DMR-2020.jpg?raw=true"/>
<br><br>
Discovery of Differntially methylated regions in smokers vs non smokers validated the finding from several other research groups. We were able to see variation in the methylation status based on Race. For prognosis prediction on this [dataset](https://medicine.yale.edu/intmed/vacs/), we used [Veterans Aging Cohort (VACS) Index](https://medicine.yale.edu/intmed/vacs/vacsresources/vacsindexinfo/). Use of support Vector Machines gave the best accuracy. Used of different and more lineant thresholding to extract more features and more information could lead to good AUCs for the methylated regions to be used as Biomarkers or predictors. [More info..](/ppt/DMR.pptx)

---
### More Projects

##### [Genome Assembly and Comparative Genomic Study on CDC's foodborn disease Outbreaks ](pdf/FoodBorne_DiseaseOutbreakStudy_2020.pdf)

##### [Differential gene expression in lung cancer cell lines between wildtype and mutant/variant p53](https://gtbinf.wordpress.com/2019/11/08/differential-gene-expression-in-lung-cancer-cell-lines-between-wildtype-and-mutant-variant-p53/)

##### [Exome Analysis of Utah Resident with Northern and Western European Ancestry](https://gtbinf.wordpress.com/2019/11/25/exome-analysis-of-utah-resident-with-northern-and-western-european-ancestry/)


---

## Publications
#### [FeatureCorr: An R package to study feature correlations aided with data transformation for sequencing and microarray data(<i> In Press </i>)](https://doi.org/10.1016/j.simpa.2021.100144)
<p style="font-size:12px"> <b> Deepali Kundnani </b>, Francesca Storici </p>
<p style="font-size:10px">FeatureCorr is an R package which aids in association and network analysis of data obtained from preliminary bioinformatic analysis of next generation sequencing(NGS) or microarray experiments. These experiments are widely used for various applications like mutation and expression profiles, detection of epigenetic changes in the genomic DNA, etc. FeatureCorr enables users in cleaning and preprocessing of data to minimize batch effects and for background noise removal. FeatureCorr can help in analysis of feature correlation in different ways: Correlation of one Feature vs multiple Features, pairwise correlation of multiple features against multiple features, and in-depth correlation and distributions of two features.</p>


#### [Gene co-expression analysis of human RNASEH2A reveals functional networks associated with DNA replication, DNA damage response, and cell cycle regulation](https://doi.org/10.3390/biology10030221)
<p style="font-size:12px"> Stefania Marsili, Ailone Tichon,<b> Deepali Kundnani </b>, Francesca Storici </p>
<p style="font-size:10px">RNASEH2A is highly expressed in human proliferative tissues and many cancers. Our analyses reveal a possible involvement of RNASEH2A in cell cycle regulation in addition to its well established role in DNA replication and DNA repair. Our findings underscore that RNASEH2A could serve as a biomarker for cancer diagnosis and a therapeutic target.</p>

#### [Contribution of a Blood-Based Protein Biomarker Panel to the Classification of Indeterminate Pulmonary Nodules](https://doi.org/10.1016/j.jtho.2020.09.024)
<p style="font-size:12px"> Edwin J Ostrin, Leonidas E Bantis, David O Wilson, Nikul Patel, Renwei Wang, <b> Deepali Kundnani </b>, Jennifer Adams-Haduch, Jennifer B Dennison, Johannes F Fahrmann, Hsienchang Thomas Chiu, Adi Gazdar, Ziding Feng, Jian-Min Yuan, Samir M Hanash </p>
<p style="font-size:10px">A four-marker biomarker panel, previously validated to improve lung cancer risk prediction, was found to also have utility in distinguishing benign from malignant indeterminate pulmonary nodules. Its performance in improving sensitivity at a high specificity indicates potential utility of the marker panel in assessing likelihood of malignancy in otherwise indeterminate nodules.</p>

#### [NFATc Acts as a Non-Canonical Phenotypic Stability Factor for a Hybrid Epithelial/Mesenchymal Phenotype](https://doi.org/10.3389/fonc.2020.553342)
<p style="font-size:12px"> Ayalur Raghu Subbalakshmi,<b> Deepali Kundnani </b>, Kuheli Biswas, Anandamohan Ghosh, Samir M Hanash, Satyendra C Tripathi, Mohit Kumar Jolly </p>
<p style="font-size:10px">Reversible transitions between epithelial and mesenchymal phenotypes – epithelial–mesenchymal transition (EMT) and its reverse mesenchymal–epithelial transition (MET) – form a key axis of phenotypic plasticity during metastasis and therapy resistance. Here, employing an integrated computational-experimental approach, we show that the transcription factor nuclear factor of activated T-cell (NFATc) can inhibit the process of complete EMT, thus stabilizing the hybrid E/M phenotype. It increases the range of parameters enabling the existence of a hybrid E/M phenotype, thus behaving as a phenotypic stability factor (PSF). Clinical data suggests the effect of NFATc on patient survival in a tissue-specific or context-dependent manner. Together, our results indicate that NFATc behaves as a non-canonical PSF for a hybrid E/M phenotype.</p>


#### [Exosomes harbor B cell targets in pancreatic adenocarcinoma and exert decoy function against complement-mediated cytotoxicity](http://example.com/)
<p style="font-size:12px"> Michela Capello, Jody V Vykoukal, Hiroyuki Katayama, Leonidas E Bantis, Hong Wang,<b> Deepali L Kundnani </b>, Clemente Aguilar-Bonavides, Mitzi Aguilar, Satyendra C Tripathi, Dilsher S Dhillon, Amin A Momin, Haley Peters, Matthew H Katz, Hector Alvarez, Vincent Bernard, Sammy Ferri-Borgogno, Randall Brand, Douglas G Adler, Matthew A Firpo, Sean J Mulvihill, Jeffrey J Molldrem, Ziding Feng, Ayumu Taguchi, Anirban Maitra, Samir M Hanash </p>
<p style="font-size:10px">Investigation of the repertoire of antigens associated with humoral immune response in pancreatic ductal adenocarcinoma (PDAC) using in-depth proteomic profiling of immunoglobulin-bound proteins from PDAC patient plasmas and identify tumor antigens that induce antibody response together with exosome hallmark proteins. PDAC-derived exosomes are seen to induce a dose-dependent inhibition of PDAC serum-mediated complement-dependent cytotoxicity towards cancer cells. </p>


#### [Sequential validation of blood-based protein biomarker candidates for early-stage pancreatic cancer](http://example.com/)
<p style="font-size:12px"> Michela Capello, Leonidas E Bantis, Ghislaine Scelo, Yang Zhao, Peng Li, Dilsher S Dhillon, Nikul J Patel, <b> Deepali L Kundnani </b>, Hong Wang, James L Abbruzzese, Anirban Maitra, Margaret A Tempero, Randall Brand, Matthew A Firpo, Sean J Mulvihill, Matthew H Katz, Paul Brennan, Ziding Feng, Ayumu Taguchi, Samir M Hanash </p>
<p style="font-size:10px">Multiple cohort testing and validation yielded a model that consisted of TIMP1, LRG1, and CA19-9 as early pancreatic ductal adenocarcinoma (PDAC) biomarkers. The model yielded areas under the curve (AUCs) of 0.949 (95% confidence interval [CI] = 0.917 to 0.981) and 0.887 (95% CI = 0.817 to 0.957) with sensitivities of 0.849 and 0.667 at 95% specificity in discriminating early-stage PDAC vs healthy subjects in the combined validation and test sets, respectively. The performance of the biomarker panel was statistically significantly improved compared with CA19-9 alone (P < .001, combined validation set; P = .008, test set).The addition of TIMP1 and LRG1 immunoassays to CA19-9 statistically significantly improves the detection of early-stage PDAC.</p>

#### [See Complete list of publications](pdf/DK-Publications-2021.pdf)

<div class="badge-base LI-profile-badge" data-locale="en_US" data-size="medium" data-theme="light" data-type="VERTICAL" data-vanity="deepalik" data-version="v1"><a class="badge-base__link LI-simple-link" href="https://www.linkedin.com/in/deepalik?trk=profile-badge">Deepali Kundnani</a></div>
              

