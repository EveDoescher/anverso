'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

interface ProfileSummary {
  id: string;
  name: string;
  description: string;
}

export default function CreateProfile() {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const router = useRouter();

  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // --- META ---
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // --- PAGE RULE ---
  const [paperFormat, setPaperFormat] = useState('A4');
  const [widthCm, setWidthCm] = useState(21);
  const [heightCm, setHeightCm] = useState(29.7);
  const [orientation, setOrientation] = useState('PORTRAIT');
  const [marginTopCm, setMarginTopCm] = useState(3);
  const [marginRightCm, setMarginRightCm] = useState(2);
  const [marginBottomCm, setMarginBottomCm] = useState(2);
  const [marginLeftCm, setMarginLeftCm] = useState(3);

  // --- COMPONENT BUILDER (3-COLUMN) ---
  const [components, setComponents] = useState<any[]>([]);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);
  const [selectedElementIndex, setSelectedElementIndex] = useState<number | null>(null);
  const [draggedComponentIndex, setDraggedComponentIndex] = useState<number | null>(null);
  const [draggedElementIndex, setDraggedElementIndex] = useState<number | null>(null);

  // --- TEXTUAL ELEMENTS ---
  const [textualTab, setTextualTab] = useState<'CITATIONS' | 'FIGURES' | 'TABLES' | 'CODE' | 'EQUATIONS' | 'CHARTS'>('CITATIONS');
  // Figures
  const [figCaptionTemplate, setFigCaptionTemplate] = useState('Figura {num} – {title}');
  const [figSourceTemplate, setFigSourceTemplate] = useState('Fonte: {source}');
  const [figAlignment, setFigAlignment] = useState('CENTER');
  const [figFontSizePt, setFigFontSizePt] = useState(10);
  const [figNumberingStrategy, setFigNumberingStrategy] = useState('GLOBAL_SEQUENTIAL');
  const [figMaxWidthCm, setFigMaxWidthCm] = useState(16);
  // Tables
  const [tableCaptionTemplate, setTableCaptionTemplate] = useState('Tabela {num} – {title}');
  const [tableSourceTemplate, setTableSourceTemplate] = useState('Fonte: {source}');
  const [tableAlignment, setTableAlignment] = useState('CENTER');
  const [tableFontSizePt, setTableFontSizePt] = useState(10);
  const [tableNumberingStrategy, setTableNumberingStrategy] = useState('GLOBAL_SEQUENTIAL');
  const [tableRepeatHeader, setTableRepeatHeader] = useState(true);
  // Frames (Quadros)
  const [frameCaptionTemplate, setFrameCaptionTemplate] = useState('Quadro {num} – {title}');
  const [frameSourceTemplate, setFrameSourceTemplate] = useState('Fonte: {source}');
  const [frameAlignment, setFrameAlignment] = useState('CENTER');
  const [frameFontSizePt, setFrameFontSizePt] = useState(10);
  const [frameNumberingStrategy, setFrameNumberingStrategy] = useState('GLOBAL_SEQUENTIAL');
  // Citations
  const [longCitationIndentCm, setLongCitationIndentCm] = useState(4);
  const [longCitationFontSizePt, setLongCitationFontSizePt] = useState(10);
  const [citPagePrefix, setCitPagePrefix] = useState('p.');
  const [citMultiAuthorJoiner, setCitMultiAuthorJoiner] = useState('; ');
  const [citEtAl, setCitEtAl] = useState(' et al.');
  const [citApudConnector, setCitApudConnector] = useState(' apud ');
  const [citSuppressionMarker, setCitSuppressionMarker] = useState('[...]');
  const [citEmphasisOursLabel, setCitEmphasisOursLabel] = useState('grifo nosso');
  const [citEmphasisAuthorLabel, setCitEmphasisAuthorLabel] = useState('grifo do autor');
  const [citVerbalCitationLabel, setCitVerbalCitationLabel] = useState('informação verbal');
  // Code
  const [codeCaptionTemplate, setCodeCaptionTemplate] = useState('Listagem {num} – {title}');
  const [codeFontFamily, setCodeFontFamily] = useState('Courier New');
  const [codeFontSizePt, setCodeFontSizePt] = useState(10);
  const [codeNumberingStrategy, setCodeNumberingStrategy] = useState('GLOBAL_SEQUENTIAL');
  // Equations
  const [eqCaptionTemplate, setEqCaptionTemplate] = useState('({num})');
  const [eqAlignment, setEqAlignment] = useState('CENTER');
  const [eqNumberingStrategy, setEqNumberingStrategy] = useState('GLOBAL_SEQUENTIAL');
  // Charts
  const [chartCaptionTemplate, setChartCaptionTemplate] = useState('Gráfico {num} – {title}');
  const [chartSourceTemplate, setChartSourceTemplate] = useState('Fonte: {source}');
  const [chartAlignment, setChartAlignment] = useState('CENTER');
  const [chartFontSizePt, setChartFontSizePt] = useState(10);
  const [chartNumberingStrategy, setChartNumberingStrategy] = useState('GLOBAL_SEQUENTIAL');

  // --- PAGE NUMBERING ---
  const [pageNumberingEnabled, setPageNumberingEnabled] = useState(true);
  const [countFromComponentId, setCountFromComponentId] = useState('');
  const [visibleFromComponentId, setVisibleFromComponentId] = useState('');
  const [pageNumberingPlacement, setPageNumberingPlacement] = useState('HEADER_RIGHT');
  const [vertDistCm, setVertDistCm] = useState(2);
  const [horizDistCm, setHorizDistCm] = useState(2);

  // --- STYLE RULES (Basic) ---
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const [fontSizePt, setFontSizePt] = useState(12);
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [alignment, setAlignment] = useState('JUSTIFIED');
  const [firstLineIndentCm, setFirstLineIndentCm] = useState(1.25);

  // --- POST PROCESSING ---
  const [orphanTitleEnabled, setOrphanTitleEnabled] = useState(true);
  const [integrityEnabled, setIntegrityEnabled] = useState(true);
  const [marginOverflowCheck, setMarginOverflowCheck] = useState(true);
  const [fontSubCheck, setFontSubCheck] = useState(true);
  const [maxPages, setMaxPages] = useState(500);
  const [pdfOutputEnabled, setPdfOutputEnabled] = useState(false);
  
  const [tableContLabelsEnabled, setTableContLabelsEnabled] = useState(true);
  const [continuesLabel, setContinuesLabel] = useState('continua');
  const [continuationLabel, setContinuationLabel] = useState('continuação');
  const [conclusionLabel, setConclusionLabel] = useState('conclusão');

  useEffect(() => {
    loadProfiles();
  }, []);
  
  // Update numbering dropdown defaults when components change
  useEffect(() => {
    if (components.length > 0) {
      const ids = components.map(c => c.name);
      if (!ids.includes(countFromComponentId)) setCountFromComponentId(ids[0]);
      if (!ids.includes(visibleFromComponentId)) setVisibleFromComponentId(ids[0]);
    } else {
      setCountFromComponentId('');
      setVisibleFromComponentId('');
    }
  }, [components]);

  const loadProfiles = async () => {
    try {
      const res = await fetchApi('/api/v1/profiles');
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      }
    } catch (err) {
      console.error('Erro ao carregar perfis', err);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleLoadBaseProfile = async (id: string) => {
    try {
      const res = await fetchApi(`/api/v1/profiles/${id}`);
      if (res.ok) {
        let data = await res.json();
        let pData = typeof data === 'string' ? JSON.parse(data) : (data.profileData ? (typeof data.profileData === 'string' ? JSON.parse(data.profileData) : data.profileData) : data);
        
        setName(data.name || pData.displayName || '');
        setDescription(data.description || '');
        
        // Page Rules
        if (pData.pageRule) {
          setPaperFormat('Custom');
          setWidthCm(pData.pageRule.widthCm || 21);
          setHeightCm(pData.pageRule.heightCm || 29.7);
          setMarginTopCm(pData.pageRule.marginTopCm || 3);
          setMarginRightCm(pData.pageRule.marginRightCm || 2);
          setMarginBottomCm(pData.pageRule.marginBottomCm || 2);
          setMarginLeftCm(pData.pageRule.marginLeftCm || 3);
          setOrientation(pData.pageRule.orientation || 'PORTRAIT');
        }
        
        // Page Numbering
        if (pData.pageNumbering) {
          setPageNumberingEnabled(pData.pageNumbering.enabled);
          setCountFromComponentId(pData.pageNumbering.countFromComponentId || '');
          setVisibleFromComponentId(pData.pageNumbering.visibleFromComponentId || '');
          setPageNumberingPlacement(pData.pageNumbering.placement || 'HEADER_RIGHT');
          setVertDistCm(pData.pageNumbering.verticalDistanceFromPageEdgeCm || 2);
          setHorizDistCm(pData.pageNumbering.horizontalDistanceFromPageEdgeCm || 2);
        } else {
          setPageNumberingEnabled(false);
        }
        
        // Textual Elements Mapping (simplified to references and lists if needed, default to ABNT usually)
        
        // Components Mapping
        if (pData.componentOrder) {
          const newComps: any[] = [];
          pData.componentOrder.forEach((compId: string) => {
            const pComp = pData.componentRules?.[compId] || pData[compId];
            if (!pComp) return;
            
            let layoutMode = 'FLOW_TEXTUAL';
            if (pComp.slots) layoutMode = 'SINGLE_PAGE';
            else if (pComp.useTocField) layoutMode = 'SECTION_INDEX';
            else if (pComp.headingStyleId && (pComp.headingStyleId.includes('list') || pComp.entryTemplate)) layoutMode = 'ELEMENT_INDEX';
            else if (pComp.sectionTitleStyleIdsByLevel) layoutMode = 'SECTIONED';
            else if (pComp.formattingRule) layoutMode = 'REFERENCE_LIST';
            const comp: any = { name: compId, layoutMode, elements: [], _nativeRule: pComp };
            
            if (layoutMode === 'SINGLE_PAGE') {
              if (pComp.layoutRule && pComp.layoutRule.policy) {
                comp.policy = { ...pComp.layoutRule.policy };
              } else {
                comp.policy = { anchorStrategy: "LAST_GROUP_AT_SAFE_AREA_END", lineHeightStrategy: "MAX_EXACT_LINE_HEIGHT", spacerStylePolicy: "NEXT_GROUP_STYLE", safetyPolicy: "MARGIN_BASED" };
              }

              // Extract elements ordered by groups to maintain original flow and extract layout details
              if (pComp.layoutRule && pComp.layoutRule.groups) {
                pComp.layoutRule.groups.forEach((group: any, groupIndex: number) => {
                  group.items.forEach((item: any, itemIndex: number) => {
                    const slotName = item.id;
                    const slot = pComp.slots[slotName];
                    if (!slot) return;
                    
                    let typeStr = 'text';
                    if (slot.type === 'TEXT_LIST') typeStr = 'multiline';
                    else if (slot.type === 'COMPOSED_TEXT') typeStr = 'composed';
                    else if (slot.type === 'SIGNATURE_BLOCK_LIST') typeStr = 'signature';
                    
                    // Find gap weight to the next group (assigned to the last item of the current group)
                    let gapWeight = 10;
                    if (itemIndex === group.items.length - 1 && pComp.layoutRule.gapRules) {
                      const gapRule = pComp.layoutRule.gapRules.find((g: any) => g.fromGroupId === group.id);
                      if (gapRule) gapWeight = gapRule.weight;
                    }

                    let hp = 'FULL_CONTENT_WIDTH';
                    let clm, crm;
                    if (item.horizontalPlacement) {
                      if (item.horizontalPlacement.strategy === 'CUSTOM_MARGINS') {
                        hp = 'CUSTOM';
                        clm = item.horizontalPlacement.leftMarginCm;
                        crm = item.horizontalPlacement.rightMarginCm;
                      } else {
                        hp = item.horizontalPlacement.strategy;
                      }
                    }

                    comp.elements.push({ 
                      name: slotName, 
                      required: slot.required || false, 
                      type: typeStr,
                      template: slot.template,
                      fieldNames: slot.fieldNames ? slot.fieldNames.join(', ') : undefined,
                      gapWeight,
                      horizontalPlacement: hp,
                      customLeftMarginCm: clm,
                      customRightMarginCm: crm
                    });
                  });
                });
              } else {
                // Fallback if no layoutRule is present
                Object.keys(pComp.slots).forEach(slotName => {
                  const slot = pComp.slots[slotName];
                  let typeStr = 'text';
                  if (slot.type === 'TEXT_LIST') typeStr = 'multiline';
                  else if (slot.type === 'COMPOSED_TEXT') typeStr = 'composed';
                  else if (slot.type === 'SIGNATURE_BLOCK_LIST') typeStr = 'signature';
                  
                  comp.elements.push({ 
                    name: slotName, 
                    required: slot.required || false, 
                    type: typeStr,
                    template: slot.template,
                    fieldNames: slot.fieldNames ? slot.fieldNames.join(', ') : undefined,
                    gapWeight: 10,
                    horizontalPlacement: 'FULL_CONTENT_WIDTH'
                  });
                });
              }
            } else if (layoutMode === 'ELEMENT_INDEX' || layoutMode === 'SECTION_INDEX') {
              comp.indexHeading = pComp.headingText;
              if (layoutMode === 'ELEMENT_INDEX') comp.entryTemplate = pComp.entryTemplate;
              comp.elements.push({ name: 'titulo', required: true, type: 'text' });
            } else if (layoutMode === 'REFERENCE_LIST') {
               comp.headingText = pComp.headingText;
               comp.blankLinesAfterHeading = pComp.blankLinesAfterHeading;
               comp.blankLinesBetweenEntries = pComp.blankLinesBetweenEntries;
               if (pComp.formattingRule) {
                 comp.surnameGivenSeparator = pComp.formattingRule.surnameGivenSeparator;
                 comp.multiAuthorJoiner = pComp.formattingRule.multiAuthorJoiner;
                 comp.surnameUppercase = pComp.formattingRule.surnameUppercase;
                 comp.etAlThreshold = pComp.formattingRule.etAlThreshold;
               }
               comp.elements.push({ name: 'entries', required: true, type: 'array' });
            } else if (layoutMode === 'SECTIONED') {
               comp.headingTemplate = pComp.headingTemplate;
               comp.elements.push({ name: 'text', required: true, type: 'text' });
            } else {
               // FLOW_TEXTUAL fallbacks
               if (compId === 'resumo' || compId === 'abstract') {
                 comp.elements.push({ name: 'text', required: true, type: 'text' }, { name: 'keywords', required: true, type: 'array' });
               } else if (compId === 'errata') {
                 comp.elements.push({ name: 'rows', required: true, type: 'array' });
               } else if (compId === 'epigraph') {
                 comp.elements.push({ name: 'text', required: true, type: 'text' }, { name: 'author', required: true, type: 'text' }, { name: 'source', required: true, type: 'text' });
               } else if (compId === 'dedication' || compId === 'acknowledgments' || compId === 'bodyContent') {
                 comp.elements.push({ name: 'text', required: true, type: 'text' });
               } else if (compId === 'glossary' || compId.startsWith('listOf')) {
                 comp.elements.push({ name: 'terms', required: true, type: 'array' }, { name: 'definitions', required: true, type: 'array' });
               } else {
                 comp.elements.push({ name: 'conteudo', required: true, type: 'text' });
               }
            }
            
            newComps.push(comp);
          });
          setComponents(newComps);
        }
        
        setStep(1);
      }
    } catch (err) {
      console.error('Erro ao carregar perfil base', err);
      alert('Erro ao carregar perfil base');
    }
  };

  const handlePaperFormatChange = (format: string) => {
    setPaperFormat(format);
    if (format === 'A4') { setWidthCm(21); setHeightCm(29.7); }
    if (format === 'Letter') { setWidthCm(21.59); setHeightCm(27.94); }
  };

  const handleAddComponent = () => {
    const newComponent = { 
      name: `componente${components.length + 1}`, 
      layoutMode: 'SINGLE_PAGE',
      elements: [] 
    };
    setComponents([...components, newComponent]);
  };

  const handleAddElement = () => {
    if (selectedComponentIndex === null) return;
    const newComponents = [...components];
    newComponents[selectedComponentIndex].elements.push({ 
      name: `elemento${newComponents[selectedComponentIndex].elements.length + 1}`, 
      type: 'text', 
      required: false,
      uppercase: false,
      bold: false,
      italic: false,
      alignment: 'inherit',
      fontSize: 'inherit',
      marginTop: '0',
      marginBottom: '1'
    });
    setComponents(newComponents);
  };

  const handleDropComponent = (targetIndex: number) => {
    if (draggedComponentIndex === null || draggedComponentIndex === targetIndex) return;
    const newComps = [...components];
    const [draggedItem] = newComps.splice(draggedComponentIndex, 1);
    newComps.splice(targetIndex, 0, draggedItem);
    setComponents(newComps);
    setDraggedComponentIndex(null);
    if (selectedComponentIndex === draggedComponentIndex) setSelectedComponentIndex(targetIndex);
    else if (selectedComponentIndex === targetIndex) setSelectedComponentIndex(draggedComponentIndex);
  };

  const handleDropElement = (targetIndex: number) => {
    if (selectedComponentIndex === null || draggedElementIndex === null || draggedElementIndex === targetIndex) return;
    const newComps = [...components];
    const elements = newComps[selectedComponentIndex].elements;
    const [draggedItem] = elements.splice(draggedElementIndex, 1);
    elements.splice(targetIndex, 0, draggedItem);
    setComponents(newComps);
    setDraggedElementIndex(null);
    if (selectedElementIndex === draggedElementIndex) setSelectedElementIndex(targetIndex);
    else if (selectedElementIndex === targetIndex) setSelectedElementIndex(draggedElementIndex);
  };

  const handleSaveProfile = async () => {
    const generatedId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);
    
    // Convert visually built components to contract structures
    const componentOrder = components.map(c => c.name);
    
    const componentRules: any = {};
    const extraStyleRules: any[] = [];
    
    components.forEach(c => {
      const rule: any = c._nativeRule ? { ...c._nativeRule, componentId: c.name } : { componentId: c.name };
      
      if (c.layoutMode === 'SINGLE_PAGE') {
        rule.slots = {};
        rule.styleMapping = c._nativeRule?.styleMapping || {};
        rule.layoutRule = { groups: [], gapRules: [], policy: c.policy || { anchorStrategy: "LAST_GROUP_AT_SAFE_AREA_END", lineHeightStrategy: "MAX_EXACT_LINE_HEIGHT", spacerStylePolicy: "NEXT_GROUP_STYLE", safetyPolicy: "MARGIN_BASED" } };
        
        c.elements.forEach((el: any, index: number) => {
          const typeMap: Record<string, string> = { 'multiline': 'TEXT_LIST', 'composed': 'COMPOSED_TEXT', 'signature': 'SIGNATURE_BLOCK_LIST', 'text': 'TEXT' };
          rule.slots[el.name] = { type: typeMap[el.type] || 'TEXT', required: el.required };
          if (el.type === 'composed') {
            rule.slots[el.name].template = el.template;
            rule.slots[el.name].fieldNames = el.fieldNames ? el.fieldNames.split(',').map((s: string) => s.trim()) : [];
          }
          if (el.type === 'signature') {
            rule.slots[el.name].signatureLineEnabled = true;
            rule.slots[el.name].signatureLineText = "________________________________________";
            rule.slots[el.name].lineTemplates = ["{title} {name}", "{institutionName}", "{role}"];
            rule.slots[el.name].knownFieldNames = ["name", "title", "institutionName", "role"];
          }
          
          const styleId = `${c.name}.${el.name}`;
          rule.styleMapping[el.name] = styleId;
          
          rule.layoutRule.groups.push({
            id: `${c.name}.${el.name}Block`,
            required: el.required,
            items: [{
              id: el.name,
              required: el.required,
              horizontalPlacement: el.horizontalPlacement === 'CUSTOM' ? {
                strategy: 'CUSTOM_MARGINS',
                leftMarginCm: el.customLeftMarginCm,
                rightMarginCm: el.customRightMarginCm
              } : { strategy: el.horizontalPlacement || 'FULL_CONTENT_WIDTH' },
              blankLinesAfter: el.gapWeight ? 1 : 0
            }]
          });
          
          if (index > 0) {
            rule.layoutRule.gapRules.push({
              fromGroupId: `${c.name}.${c.elements[index - 1].name}Block`,
              toGroupId: `${c.name}.${el.name}Block`,
              weight: el.gapWeight || 10
            });
          }
          
          extraStyleRules.push({
            id: styleId,
            type: "PARAGRAPH",
            fontFamily,
            fontSizePt: el.fontSize === 'inherit' ? fontSizePt : Number(el.fontSize),
            alignment: el.alignment === 'inherit' ? alignment : el.alignment.toUpperCase(),
            lineSpacing,
            firstLineIndentCm: 0,
            leftIndentCm: 0,
            rightIndentCm: 0,
            spacingBeforePt: 0,
            spacingAfterPt: 0,
            bold: el.bold,
            italic: el.italic,
            uppercase: el.uppercase
          });
        });
      } else if (c.layoutMode === 'FLOW_TEXTUAL') {
        if (!c._nativeRule) {
          const firstHeading = c.elements.find((el: any) => el.type === 'HEADING');
          if (firstHeading) {
            rule.headingStyleId = `${c.name}.heading`;
            rule.headingText = firstHeading.headingText;
            extraStyleRules.push({ id: rule.headingStyleId, type: "PARAGRAPH", fontFamily, fontSizePt, alignment: "CENTER", lineSpacing, bold: true, uppercase: true });
          }
          
          const firstKeywords = c.elements.find((el: any) => el.type === 'BOLD_LABELED_KEYWORDS');
          if (firstKeywords) {
            rule.textStyleId = `${c.name}.text`;
            rule.keywordsStyleId = `${c.name}.keywords`;
            rule.keywordsLabel = firstKeywords.keywordsLabel;
            rule.keywordsSeparator = firstKeywords.keywordsSeparator;
            rule.keywordsTerminator = firstKeywords.keywordsTerminator;
            extraStyleRules.push({ id: rule.textStyleId, type: "PARAGRAPH", fontFamily, fontSizePt, alignment: "JUSTIFY", lineSpacing, firstLineIndentCm: 0 });
            extraStyleRules.push({ id: rule.keywordsStyleId, type: "PARAGRAPH", fontFamily, fontSizePt, alignment: "JUSTIFY", lineSpacing, firstLineIndentCm: 0 });
          }
          
          const firstTable = c.elements.find((el: any) => el.type === 'TABLE_BLOCK');
          if (firstTable && firstTable.tableHeaders) {
            rule.tableHeaderStyleId = `${c.name}.tableHeader`;
            rule.tableCellStyleId = `${c.name}.tableCell`;
            rule.tableHeaders = firstTable.tableHeaders.split(',').map((s: string) => s.trim());
          }

          const firstTemplated = c.elements.find((el: any) => el.type === 'TEMPLATED_TEXT' || el.type === 'composed');
          if (firstTemplated) {
            rule.textStyleId = `${c.name}.text`;
            rule.authorStyleId = `${c.name}.author`;
            rule.authorTemplate = firstTemplated.template;
          }

          const firstBlank = c.elements.find((el: any) => el.type === 'BLANK_LINES');
          if (firstBlank) rule.blankLinesAfterHeading = firstBlank.blankLinesCount;
          
          // Se for um glossary simulado
          const firstPairList = c.elements.find((el: any) => el.type === 'PAIR_LIST');
          if (firstPairList) {
            rule.entryStyleId = `${c.name}.entry`;
            rule.termSeparator = " — ";
          }
        }
      } else if (c.layoutMode === 'REFERENCE_LIST') {
        rule.headingStyleId = `${c.name}.heading`;
        rule.headingText = c.headingText ?? 'REFERÊNCIAS';
        rule.entryStyleId = `${c.name}.entry`;
        rule.blankLinesBetweenEntries = c.blankLinesBetweenEntries ?? 1;
        rule.blankLinesAfterHeading = c.blankLinesAfterHeading ?? 2;
        rule.formattingRule = {
          ...(c._nativeRule?.formattingRule || {}),
          authorFormat: {
            ...(c._nativeRule?.formattingRule?.authorFormat || {}),
            surnameUppercase: c.surnameUppercase ?? true,
            surnameGivenSeparator: c.surnameGivenSeparator ?? ', ',
            nameTerminator: '.',
            multiAuthorJoiner: c.multiAuthorJoiner ?? '; ',
            etAlLabel: 'et al.',
            etAlThreshold: c.etAlThreshold ?? 3
          },
          entryFormats: {
            ...(c._nativeRule?.formattingRule?.entryFormats || {}),
            BOOK: [
              { source: "authors", bold: false, prefix: "", suffix: "", optional: false },
              { source: "title", bold: true, prefix: "", suffix: "", optional: false },
              { source: "subtitle", bold: false, prefix: ": ", suffix: "", optional: true },
              { source: "edition", bold: false, prefix: ". ", suffix: ". ed.", optional: true },
              { source: "city", bold: false, prefix: ". ", suffix: ": ", optional: true },
              { source: "publisher", bold: false, prefix: "", suffix: ", ", optional: true },
              { source: "year", bold: false, prefix: "", suffix: ".", optional: false }
            ],
            BOOK_CHAPTER: [
              { source: "authors", bold: false, prefix: "", suffix: "", optional: false },
              { source: "title", bold: true, prefix: "", suffix: "", optional: false },
              { source: "literal:In: ", bold: false, prefix: "", suffix: "", optional: false },
              { source: "bookAuthors", bold: false, prefix: "", suffix: "", optional: true },
              { source: "bookTitle", bold: true, prefix: "", suffix: ". ", optional: true },
              { source: "edition", bold: false, prefix: "", suffix: ". ed. ", optional: true },
              { source: "city", bold: false, prefix: "", suffix: ": ", optional: true },
              { source: "publisher", bold: false, prefix: "", suffix: ", ", optional: true },
              { source: "year", bold: false, prefix: "", suffix: ".", optional: false },
              { source: "pages", bold: false, prefix: " p. ", suffix: ".", optional: true }
            ]
          }
        };
      } else if (c.layoutMode === 'BODY_CONTENT') {
        rule.styleMapping = {
          sectionTitleStyleIdsByLevel: ["bodyContent.heading1", "bodyContent.heading2", "bodyContent.heading3", "bodyContent.heading4"],
          paragraphStyleId: "bodyContent.paragraph",
          directShortQuoteStyleId: "bodyContent.paragraph",
          directLongQuoteStyleId: "bodyContent.longQuote",
          indirectCitationStyleId: "bodyContent.paragraph",
          citationOfCitationStyleId: "bodyContent.paragraph",
          listOrderedStyleId: "bodyContent.list.ordered",
          listUnorderedStyleId: "bodyContent.list.unordered",
          equationStyleId: "bodyContent.paragraph",
          footnoteCallStyleId: "bodyContent.footnoteCall",
          footnoteTextStyleId: "bodyContent.footnoteText"
        };
        rule.numbering = { enabled: c.numberingEnabled ?? true, separator: c.numberingSeparator ?? '.', primarySuffix: c.primarySuffix ?? '' };
        rule.layout = { blankLinesBeforeSectionTitleWhenPrecededByContent: c.blankLinesBeforeSection ?? 1, blankLinesAfterSectionTitle: c.blankLinesAfterSection ?? 1, pageBreakBeforePrimarySection: c.pageBreakBeforePrimary ?? true, blankLineStyleId: "bodyContent.paragraph" };
        rule.figure = { captionStyleId: "bodyContent.figure.caption", sourceStyleId: "bodyContent.figure.source", captionTemplate: figCaptionTemplate, sourceTemplate: figSourceTemplate, continuationLabels: { first: "continua", middle: "continuação", last: "conclusão" }, sourcePlacement: "LAST_PART_ONLY", imageAlignment: figAlign, maxWidthCm: figMaxWidth, maxHeightCm: figMaxHeight, defaultDpi: 96, maxImageBytes: 2000000, urlFetchTimeoutSeconds: 10, fitPolicy: "SCALE_DOWN_PRESERVE_ASPECT_RATIO", numberingStrategy: figNumberingStrategy, label: "Figura" };
        rule.table = { captionStyleId: "bodyContent.table.caption", sourceStyleId: "bodyContent.table.source", headerStyleId: "bodyContent.table.header", cellStyleId: "bodyContent.table.cell", captionTemplate: tableCaptionTemplate, sourceTemplate: tableSourceTemplate, continuationLabels: { first: "continua", middle: "continuação", last: "conclusão" }, sourcePlacement: "LAST_PART_ONLY", tableAlignment: tableAlign, widthPercent: tableWidthPercent, repeatHeaderOnPageBreak: tableRepeatHeaders, numberingStrategy: tableNumberingStrategy, label: "Tabela" };
        rule.frame = { captionStyleId: "bodyContent.frame.caption", sourceStyleId: "bodyContent.frame.source", headerStyleId: "bodyContent.frame.header", cellStyleId: "bodyContent.frame.cell", captionTemplate: frameCaptionTemplate, sourceTemplate: frameSourceTemplate, continuationLabels: { first: "continua", middle: "continuação", last: "conclusão" }, sourcePlacement: "LAST_PART_ONLY", tableAlignment: frameAlign, widthPercent: frameWidthPercent, repeatHeaderOnPageBreak: frameRepeatHeaders, numberingStrategy: frameNumberingStrategy, label: "Quadro" };
        rule.codeListing = { captionStyleId: "bodyContent.figure.caption", sourceStyleId: "bodyContent.figure.source", codeStyleId: "bodyContent.codeListing.code", captionTemplate: codeCaptionTemplate, sourceTemplate: codeSourceTemplate, continuationLabels: { first: "continua", middle: "continuação", last: "conclusão" }, sourcePlacement: "LAST_PART_ONLY", codeAlignment: codeAlign, widthPercent: codeWidthPercent, repeatHeaderOnPageBreak: codeRepeatHeaders, numberingStrategy: codeNumberingStrategy, label: "Código-fonte" };
        rule.chart = { captionStyleId: "bodyContent.figure.caption", sourceStyleId: "bodyContent.figure.source", captionTemplate: chartCaptionTemplate, sourceTemplate: chartSourceTemplate, continuationLabels: { first: "continua", middle: "continuação", last: "conclusão" }, sourcePlacement: "LAST_PART_ONLY", imageAlignment: chartAlign, maxWidthCm: chartMaxWidth, maxHeightCm: chartMaxHeight, numberingStrategy: chartNumberingStrategy, label: "Gráfico" };
        rule.equation = { captionStyleId: "bodyContent.figure.caption", sourceStyleId: "bodyContent.figure.source", numberingTemplate: equationCaptionTemplate, numberingAlignment: "RIGHT", equationAlignment: equationAlign, numberingStrategy: equationNumberingStrategy, label: "Equação" };
        rule.crossReferenceLabels = { sectionLabel: "Seção", figureLabel: "Figura", tableLabel: "Tabela", frameLabel: "Quadro", chartLabel: "Gráfico", codeListingLabel: "Listagem", equationLabel: "Equação" };
      } else if (c.layoutMode === 'SECTIONED') {
        rule.headingTemplate = c.headingTemplate ?? '{letter} — {title}';
        rule.headingStyleId = `${c.name}.heading`;
        rule.paragraphStyleId = "bodyContent.paragraph";
        rule.sectionTitleStyleIdsByLevel = ["bodyContent.heading1", "bodyContent.heading2"];
      } else if (c.layoutMode === 'ELEMENT_INDEX') {
        rule.headingStyleId = "list.heading";
        rule.headingText = c.indexHeading ?? 'LISTA';
        rule.entryStyleId = "list.entry";
        rule.blankLinesAfterHeading = 1;
        
        // Match specific ABNT profile list formats
        if (c.name.toLowerCase().includes("abbreviation") || c.name.toLowerCase().includes("symbol")) {
          rule.termSeparator = " — ";
          if (c.name.toLowerCase().includes("abbreviation")) rule.sortAlphabetically = true;
        } else {
          rule.entryTemplate = c.entryTemplate ?? "{number} — {caption}";
        }
      } else if (c.layoutMode === 'SECTION_INDEX') {
        rule.headingStyleId = "list.heading";
        rule.headingText = c.indexHeading ?? 'SUMÁRIO';
        rule.entryStyleIdsByLevel = ["list.entry", "list.entry", "list.entry", "list.entry", "list.entry", "list.entry"];
        rule.useTocField = true;
      }
      
      componentRules[c.name] = rule;
    });

    const profileData = {
      id: generatedId,
      displayName: name,
      componentOrder,
      pageRule: { widthCm, heightCm, marginTopCm, marginRightCm, marginBottomCm, marginLeftCm, orientation },
      ...(pageNumberingEnabled && countFromComponentId && visibleFromComponentId && {
        pageNumbering: { enabled: true, countFromComponentId, visibleFromComponentId, styleId: "pageNumber", placement: pageNumberingPlacement, verticalDistanceFromPageEdgeCm: vertDistCm, horizontalDistanceFromPageEdgeCm: horizDistCm }
      }),
      postProcessing: {
        tableContinuationLabels: { enabled: tableContLabelsEnabled, continuesLabel, continuationLabel, conclusionLabel, labelStyleId: "bodyContent.paragraph" },
        orphanTitleCorrection: { enabled: orphanTitleEnabled },
        integrityCheck: { enabled: integrityEnabled, checkMarginOverflow: marginOverflowCheck, checkFontSubstitution: fontSubCheck, maxPages },
        pdfOutput: { enabled: pdfOutputEnabled }
      },
      styleRules: [
        { id: "bodyContent.paragraph", type: "PARAGRAPH", fontFamily, fontSizePt, alignment, lineSpacing, firstLineIndentCm, leftIndentCm: 0, rightIndentCm: 0, spacingBeforePt: 0, spacingAfterPt: 0, bold: false, italic: false, uppercase: false },
        { id: "pageNumber", type: "CHARACTER", fontFamily, fontSizePt: 10, alignment: "RIGHT", lineSpacing: 1.0, firstLineIndentCm: 0, leftIndentCm: 0, rightIndentCm: 0, spacingBeforePt: 0, spacingAfterPt: 0, bold: false, italic: false, uppercase: false },
        ...extraStyleRules
      ],
      ...componentRules
    };

    const payload = {
      id: generatedId,
      name,
      description,
      isPublic,
      profileData: JSON.stringify(profileData),
    };

    try {
      const res = await fetchApi('/api/v1/profiles', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Erro ao salvar no backend');
      alert('Perfil criado com sucesso!');
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Erro ao criar perfil');
    }
  };

  const renderStepper = () => (
    <div className="flex justify-center mb-8">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['Início', 'Info. Básicas', 'Construtor', 'Elementos Textuais', 'Numeração', 'Validações'].map((label, idx) => (
          <div key={idx} className="flex items-center whitespace-nowrap">
            <div className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${step === idx ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-600 cursor-pointer hover:bg-gray-300'}`} onClick={() => { if(step !== 0) setStep(idx as any) }}>
              {idx + 1}. {label}
            </div>
            {idx < 5 && <div className="w-4 lg:w-8 h-px bg-gray-300 mx-2"></div>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm border-b p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 transition-colors">
            &larr; Voltar
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Profile Builder</h1>
        </div>
        {step > 0 && (
          <button onClick={handleSaveProfile} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-sm hover:shadow">
            Salvar Perfil
          </button>
        )}
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {step > 0 && renderStepper()}

        {step === 0 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Começar um novo Perfil</h2>
              <p className="text-slate-600 mb-6">Crie um perfil definindo regras de página, margens, numeração e componentes do zero.</p>
              <button onClick={() => setStep(1)} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow">
                Criar Perfil do Zero
              </button>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-4">Ou use um perfil existente como base</h2>
              {loadingProfiles ? (
                <div className="text-center p-8 text-slate-500 animate-pulse">Carregando perfis...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profiles.map(p => (
                    <div key={p.id} className="border border-slate-200 p-5 rounded-lg hover:border-blue-400 hover:shadow-md transition bg-slate-50 flex flex-col justify-between group cursor-pointer" onClick={() => handleLoadBaseProfile(p.id)}>
                      <div>
                        <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                        <p className="text-xs text-slate-400 mb-3 font-mono">{p.id}</p>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">{p.description}</p>
                      </div>
                      <div className="text-blue-600 text-sm font-medium">Usar como Base &rarr;</div>
                    </div>
                  ))}
                  {profiles.length === 0 && (
                    <div className="col-span-full text-center text-slate-500 p-8 border-2 border-dashed border-slate-200 rounded-lg">
                      Nenhum perfil encontrado no sistema.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Informações Básicas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nome do Perfil</label>
                  <input type="text" className="w-full border-slate-300 border p-3 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: ABNT Padrão" />
                </div>
                <div className="col-span-full">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição</label>
                  <textarea className="w-full border-slate-300 border p-3 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Descreva as regras deste perfil..."/>
                </div>
                <div className="col-span-full flex items-center gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <input type="checkbox" id="isPublic" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"/>
                  <label htmlFor="isPublic" className="font-medium text-slate-700 cursor-pointer">Tornar este perfil público para outros usuários</label>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Regras e Dimensões de Página</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Formato</label>
                  <select className="w-full border-slate-300 border p-3 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white" value={paperFormat} onChange={e => handlePaperFormatChange(e.target.value)}>
                    <option value="A4">A4 (21 x 29.7 cm)</option>
                    <option value="Letter">Carta (21.59 x 27.94 cm)</option>
                    <option value="Custom">Personalizado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Orientação</label>
                  <select className="w-full border-slate-300 border p-3 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white" value={orientation} onChange={e => setOrientation(e.target.value)}>
                    <option value="PORTRAIT">Retrato</option>
                    <option value="LANDSCAPE">Paisagem</option>
                  </select>
                </div>
                {paperFormat === 'Custom' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Largura (cm)</label>
                      <input type="number" step="0.1" className="w-full border-slate-300 border p-3 rounded-lg text-slate-800" value={widthCm} onChange={e => setWidthCm(Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Altura (cm)</label>
                      <input type="number" step="0.1" className="w-full border-slate-300 border p-3 rounded-lg text-slate-800" value={heightCm} onChange={e => setHeightCm(Number(e.target.value))} />
                    </div>
                  </>
                )}
              </div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Margens (cm)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Superior</label>
                  <input type="number" step="0.1" className="w-full border-slate-300 border p-2 rounded text-slate-800" value={marginTopCm} onChange={e => setMarginTopCm(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Inferior</label>
                  <input type="number" step="0.1" className="w-full border-slate-300 border p-2 rounded text-slate-800" value={marginBottomCm} onChange={e => setMarginBottomCm(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Esquerda</label>
                  <input type="number" step="0.1" className="w-full border-slate-300 border p-2 rounded text-slate-800" value={marginLeftCm} onChange={e => setMarginLeftCm(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Direita</label>
                  <input type="number" step="0.1" className="w-full border-slate-300 border p-2 rounded text-slate-800" value={marginRightCm} onChange={e => setMarginRightCm(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b">Tipografia e Estilo Base</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-lg border border-slate-100">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Família de Fonte</label>
                  <select className="w-full border-slate-300 border p-3 rounded-lg text-slate-800 bg-white" value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Arial">Arial</option>
                    <option value="Calibri">Calibri</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tamanho Base (pt)</label>
                  <input type="number" step="0.5" className="w-full border-slate-300 border p-3 rounded-lg text-slate-800" value={fontSizePt} onChange={e => setFontSizePt(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Espaçamento de Linhas Base</label>
                  <select className="w-full border-slate-300 border p-3 rounded-lg text-slate-800 bg-white" value={lineSpacing} onChange={e => setLineSpacing(Number(e.target.value))}>
                    <option value={1.0}>Simples (1.0)</option>
                    <option value={1.15}>1.15</option>
                    <option value={1.5}>1.5</option>
                    <option value={2.0}>Duplo (2.0)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Alinhamento Base</label>
                  <select className="w-full border-slate-300 border p-3 rounded-lg text-slate-800 bg-white" value={alignment} onChange={e => setAlignment(e.target.value)}>
                    <option value="JUSTIFIED">Justificado</option>
                    <option value="LEFT">Esquerda</option>
                    <option value="CENTER">Centralizado</option>
                    <option value="RIGHT">Direita</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Recuo Primeira Linha (cm)</label>
                  <input type="number" step="0.1" className="w-full border-slate-300 border p-3 rounded-lg text-slate-800" value={firstLineIndentCm} onChange={e => setFirstLineIndentCm(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8 pt-4 border-t border-slate-200">
              <div />
              <button onClick={() => setStep(2)} className="bg-slate-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-900 transition">Próximo Passo &rarr;</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 h-[85vh] min-h-[800px]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Construtor de Componentes</h2>
                <p className="text-sm text-slate-600">Crie a estrutura do seu documento, arrastando para reordenar.</p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-6 h-full min-h-0">
              {/* Coluna 1: Componentes */}
              <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col shadow-sm">
                <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
                  <h3 className="font-semibold text-sm text-slate-800">1. Componentes</h3>
                  <button onClick={handleAddComponent} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 font-medium transition shadow-sm">+ Adicionar</button>
                </div>
                <div className="flex-1 overflow-auto p-3 space-y-2 bg-white">
                  {components.map((comp, idx) => (
                    <div 
                      key={idx} 
                      draggable
                      onDragStart={() => setDraggedComponentIndex(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDropComponent(idx)}
                      onClick={() => { setSelectedComponentIndex(idx); setSelectedElementIndex(null); }}
                      className={`p-3 border rounded-lg cursor-grab active:cursor-grabbing text-sm font-medium transition flex justify-between items-center group ${selectedComponentIndex === idx ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50'} ${draggedComponentIndex === idx ? 'opacity-50' : ''}`}
                    >
                      <span className="truncate">{comp.name}</span>
                      <span className="text-slate-400 group-hover:text-blue-400">≡</span>
                    </div>
                  ))}
                  {components.length === 0 && <div className="text-sm text-slate-400 p-6 text-center border-2 border-dashed border-slate-100 rounded-lg mt-4">Nenhum componente. Adicione o primeiro!</div>}
                </div>
              </div>

              {/* Coluna 2: Elementos */}
              <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col shadow-sm">
                <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
                  <h3 className="font-semibold text-sm text-slate-800">2. Elementos (Slots)</h3>
                  {selectedComponentIndex !== null && (
                    <button onClick={handleAddElement} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 font-medium transition shadow-sm">+ Adicionar</button>
                  )}
                </div>
                <div className="flex-1 overflow-auto p-3 space-y-2 bg-white">
                  {selectedComponentIndex === null ? (
                    <div className="text-sm text-slate-400 p-6 text-center mt-4">Selecione um componente na coluna anterior para ver seus elementos.</div>
                  ) : (
                    components[selectedComponentIndex].elements.map((el: any, elIdx: number) => (
                      <div 
                        key={elIdx}
                        draggable
                        onDragStart={() => setDraggedElementIndex(elIdx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropElement(elIdx)}
                        onClick={() => setSelectedElementIndex(elIdx)}
                        className={`p-3 border rounded-lg cursor-grab active:cursor-grabbing text-sm transition flex justify-between items-center group ${selectedElementIndex === elIdx ? 'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm' : 'border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50'} ${draggedElementIndex === elIdx ? 'opacity-50' : ''}`}
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="font-medium truncate">{el.name}</span>
                          <span className={`text-[11px] uppercase tracking-wider font-semibold ${selectedElementIndex === elIdx ? 'text-indigo-400' : 'text-slate-400'}`}>{el.type}</span>
                        </div>
                        <span className="text-slate-400 group-hover:text-indigo-400 flex-shrink-0">≡</span>
                      </div>
                    ))
                  )}
                  {selectedComponentIndex !== null && components[selectedComponentIndex].elements.length === 0 && (
                    <div className="text-sm text-slate-400 p-6 text-center border-2 border-dashed border-slate-100 rounded-lg mt-4">Sem elementos internos. Adicione slots para este componente.</div>
                  )}
                </div>
              </div>

              {/* Coluna 3: Inspetor */}
              <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col shadow-sm">
                <div className="p-3 border-b bg-slate-50">
                  <h3 className="font-semibold text-sm text-slate-800">3. Inspetor de Propriedades</h3>
                </div>
                <div className="flex-1 overflow-auto p-5 bg-white">
                  {selectedComponentIndex !== null && selectedElementIndex === null && (
                    <div className="space-y-5 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Componente</span>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-600">ID / Nome do Componente</label>
                        <input 
                          type="text" 
                          className="w-full border border-slate-300 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 transition"
                          value={components[selectedComponentIndex].name || ''}
                          onChange={e => {
                            const newComps = [...components];
                            newComps[selectedComponentIndex].name = e.target.value.replace(/[^a-zA-Z0-9]/g, ''); // enforce valid IDs
                            setComponents(newComps);
                          }}
                          placeholder="Ex: cover, abstract..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-600">Comportamento do Componente</label>
                        <select 
                          className="w-full border border-slate-300 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white transition"
                          value={components[selectedComponentIndex].layoutMode || 'SINGLE_PAGE'}
                          onChange={e => {
                            const newComps = [...components];
                            newComps[selectedComponentIndex].layoutMode = e.target.value;
                            setComponents(newComps);
                          }}
                        >
                          <option value="SINGLE_PAGE">Página Única Estruturada (Ex: Capa, Folha de Rosto)</option>
                          <option value="BODY_CONTENT">Capítulos / Desenvolvimento (Com paginação e seções)</option>
                          <option value="REFERENCE_LIST">Lista de Referências Bibliográficas</option>
                          <option value="FLOW_TEXTUAL">Página Corrida Simples (Sem divisão de capítulos)</option>
                          <option value="SECTIONED">Seções Especiais (Ex: Apêndices, Anexos com Letras)</option>
                          <option value="ELEMENT_INDEX">Lista de Elementos (Ex: Lista de Figuras, Tabelas)</option>
                          <option value="SECTION_INDEX">Sumário (Índice de Seções)</option>
                        </select>
                      </div>

                      {/* --- CAMPOS DINÂMICOS POR RULETYPE --- */}
                      
                      {components[selectedComponentIndex].layoutMode === 'BODY_CONTENT' && (
                        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Regras de Texto e Numeração</h4>
                          
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={components[selectedComponentIndex].numberingEnabled ?? true}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].numberingEnabled = e.target.checked;
                                setComponents(newComps);
                              }}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-slate-700">Habilitar numeração automática de seções (ex: 1.2)</span>
                          </label>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-600">Separador (Numeração)</label>
                              <input 
                                type="text" 
                                className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                                value={components[selectedComponentIndex].numberingSeparator ?? '.'}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].numberingSeparator = e.target.value;
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-600">Sufixo Primário</label>
                              <input 
                                type="text" 
                                className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                                value={components[selectedComponentIndex].primarySuffix ?? ''}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].primarySuffix = e.target.value;
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                          </div>

                          <label className="flex items-center gap-3 cursor-pointer mt-2">
                            <input 
                              type="checkbox" 
                              checked={components[selectedComponentIndex].pageBreakBeforePrimary ?? true}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].pageBreakBeforePrimary = e.target.checked;
                                setComponents(newComps);
                              }}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-slate-700">Quebra de página antes de seção nível 1</span>
                          </label>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-600">Linhas em branco (Antes do Título)</label>
                              <input 
                                type="number" min="0"
                                className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                                value={components[selectedComponentIndex].blankLinesBeforeSection ?? 1}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].blankLinesBeforeSection = parseInt(e.target.value);
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-600">Linhas em branco (Depois do Título)</label>
                              <input 
                                type="number" min="0"
                                className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                                value={components[selectedComponentIndex].blankLinesAfterSection ?? 1}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].blankLinesAfterSection = parseInt(e.target.value);
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {components[selectedComponentIndex].layoutMode === 'REFERENCE_LIST' && (
                        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configuração da Bibliografia</h4>
                          <div>
                            <label className="block text-xs font-semibold mb-1 text-slate-600">Título da Página (ex: REFERÊNCIAS)</label>
                            <input 
                              type="text" 
                              className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                              value={components[selectedComponentIndex].headingText ?? 'REFERÊNCIAS'}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].headingText = e.target.value;
                                setComponents(newComps);
                              }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-600">Linhas em branco após Título</label>
                              <input 
                                type="number" min="0"
                                className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                                value={components[selectedComponentIndex].blankLinesAfterHeading ?? 2}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].blankLinesAfterHeading = parseInt(e.target.value);
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-600">Linhas em branco entre Entradas</label>
                              <input 
                                type="number" min="0"
                                className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                                value={components[selectedComponentIndex].blankLinesBetweenEntries ?? 1}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].blankLinesBetweenEntries = parseInt(e.target.value);
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                          </div>
                          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-2">Formatação de Autores (authorFormat)</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-600">Separador (Nome, Sobrenome)</label>
                              <input 
                                type="text" 
                                className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                                value={components[selectedComponentIndex].surnameGivenSeparator ?? ', '}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].surnameGivenSeparator = e.target.value;
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-600">Junção Multi-Autor (ex: ; )</label>
                              <input 
                                type="text" 
                                className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                                value={components[selectedComponentIndex].multiAuthorJoiner ?? '; '}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].multiAuthorJoiner = e.target.value;
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-2 cursor-pointer mt-2">
                              <input 
                                type="checkbox" 
                                checked={components[selectedComponentIndex].surnameUppercase ?? true}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].surnameUppercase = e.target.checked;
                                  setComponents(newComps);
                                }}
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                              />
                              <span className="text-xs font-medium text-slate-700">Sobrenome Maiúsculo</span>
                            </label>
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-600">Limite Et Al. (Qtd. Autores)</label>
                              <input 
                                type="number" min="1"
                                className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                                value={components[selectedComponentIndex].etAlThreshold ?? 3}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].etAlThreshold = parseInt(e.target.value);
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {components[selectedComponentIndex].layoutMode === 'SECTIONED' && (
                        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configuração de Seções (Anexos/Apêndices)</h4>
                          <div>
                            <label className="block text-xs font-semibold mb-1 text-slate-600">Template do Título (ex: &#123;letter&#125; — &#123;title&#125;)</label>
                            <input 
                              type="text" 
                              className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                              value={components[selectedComponentIndex].headingTemplate ?? '{letter} — {title}'}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].headingTemplate = e.target.value;
                                setComponents(newComps);
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {(components[selectedComponentIndex].layoutMode === 'ELEMENT_INDEX' || components[selectedComponentIndex].layoutMode === 'SECTION_INDEX') && (
                        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configuração do Índice/Sumário</h4>
                          
                          <div>
                            <label className="block text-xs font-semibold mb-1 text-slate-600">Título Principal da Página (ex: SUMÁRIO ou LISTA DE FIGURAS)</label>
                            <input 
                              type="text" 
                              className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                              value={components[selectedComponentIndex].indexHeading ?? 'SUMÁRIO'}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].indexHeading = e.target.value;
                                setComponents(newComps);
                              }}
                            />
                          </div>
                          
                          {components[selectedComponentIndex].layoutMode === 'ELEMENT_INDEX' && 
                           !components[selectedComponentIndex].name.toLowerCase().includes('abbreviation') && 
                           !components[selectedComponentIndex].name.toLowerCase().includes('symbol') && (
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-600">Template da Linha (ex: &#123;number&#125; — &#123;caption&#125;)</label>
                              <input 
                                type="text" 
                                className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                                value={components[selectedComponentIndex].entryTemplate ?? '{number} — {caption}'}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].entryTemplate = e.target.value;
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {components[selectedComponentIndex].layoutMode === 'SINGLE_PAGE' && (
                        <div className="pt-4 border-t border-slate-100">
                          <p className="text-xs text-slate-500 italic bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <strong>Dica:</strong> Para uma Página Única (Capa, Folha de Rosto), utilize a coluna "Elementos (Slots)" ao lado para criar os campos textuais (Autor, Título, Ano, etc.) que o usuário deverá preencher.
                          </p>
                        </div>
                      )}

                      <div className="pt-4 mt-2 border-t border-slate-100">
                        <button 
                          onClick={() => {
                            const newComps = [...components];
                            newComps.splice(selectedComponentIndex, 1);
                            setComponents(newComps);
                            setSelectedComponentIndex(null);
                          }}
                          className="w-full py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                        >
                          Excluir Componente
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedComponentIndex !== null && selectedElementIndex !== null && (
                    <div className="space-y-5 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Elemento / Slot</span>
                      </div>
                      
                      {/* Básico */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-600">Nome do Slot (ID interno)</label>
                          <input 
                            type="text" 
                            className="w-full border border-slate-300 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 transition"
                            value={components[selectedComponentIndex].elements[selectedElementIndex].name || ''}
                            onChange={e => {
                              const newComps = [...components];
                              newComps[selectedComponentIndex].elements[selectedElementIndex].name = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                              setComponents(newComps);
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-xs font-semibold mb-1 text-slate-600">Tipo de Dado</label>
                            {components[selectedComponentIndex].layoutMode === 'FLOW_TEXTUAL' ? (
                              <select 
                                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 transition"
                                value={components[selectedComponentIndex].elements[selectedElementIndex].type || 'PLAIN_TEXT'}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].type = e.target.value;
                                  setComponents(newComps);
                                }}
                              >
                                <option value="HEADING">Título Fixo (HEADING)</option>
                                <option value="BLANK_LINES">Linhas em Branco (BLANK_LINES)</option>
                                <option value="PLAIN_TEXT">Parágrafo Simples (PLAIN_TEXT)</option>
                                <option value="TEMPLATED_TEXT">Texto com Template (TEMPLATED_TEXT)</option>
                                <option value="BOLD_LABELED_KEYWORDS">Bloco de Palavras-chave (BOLD_LABELED_KEYWORDS)</option>
                                <option value="PAIR_LIST">Lista de Pares (PAIR_LIST)</option>
                                <option value="TABLE_BLOCK">Bloco de Tabela (TABLE_BLOCK)</option>
                                <option value="REPEAT_GROUP">Grupo de Repetição (REPEAT_GROUP)</option>
                              </select>
                            ) : (
                              <select 
                                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 transition"
                                value={components[selectedComponentIndex].elements[selectedElementIndex].type || 'text'}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].type = e.target.value;
                                  setComponents(newComps);
                                }}
                              >
                                <option value="text">Texto Curto (Uma única linha)</option>
                                <option value="multiline">Texto Longo (Vários parágrafos)</option>
                                <option value="composed">Texto Composto (Gerado por template automático)</option>
                                <option value="signature">Blocos de Assinatura (Múltiplas pessoas)</option>
                              </select>
                            )}
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center gap-3 cursor-pointer p-2 bg-slate-50 border border-slate-100 rounded-lg w-full">
                              <input 
                                type="checkbox" 
                                checked={components[selectedComponentIndex].elements[selectedElementIndex].required || false}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].required = e.target.checked;
                                  setComponents(newComps);
                                }}
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                              />
                              <span className="text-sm font-medium text-slate-700">Preenchimento Obrigatório</span>
                            </label>
                          </div>
                        </div>

                        {/* Campos específicos por Tipo de Dado (Genéricos) */}
                        {(components[selectedComponentIndex].elements[selectedElementIndex].type === 'composed' || components[selectedComponentIndex].elements[selectedElementIndex].type === 'TEMPLATED_TEXT') && (
                          <div className="grid grid-cols-1 gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg mt-2">
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-indigo-900">Template (ex: &#123;nome&#125; - &#123;ano&#125;)</label>
                              <input 
                                type="text" 
                                className="w-full border border-indigo-200 p-2 rounded text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                value={components[selectedComponentIndex].elements[selectedElementIndex].template || ''}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].template = e.target.value;
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-indigo-900">Campos (separados por vírgula)</label>
                              <input 
                                type="text" 
                                className="w-full border border-indigo-200 p-2 rounded text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                value={components[selectedComponentIndex].elements[selectedElementIndex].fieldNames || ''}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].fieldNames = e.target.value;
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {components[selectedComponentIndex].elements[selectedElementIndex].type === 'HEADING' && (
                          <div className="grid grid-cols-1 gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg mt-2">
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-indigo-900">Texto Fixo do Título (ex: ERRATA)</label>
                              <input 
                                type="text" 
                                className="w-full border border-indigo-200 p-2 rounded text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                value={components[selectedComponentIndex].elements[selectedElementIndex].headingText || ''}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].headingText = e.target.value;
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {components[selectedComponentIndex].elements[selectedElementIndex].type === 'BLANK_LINES' && (
                          <div className="grid grid-cols-1 gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg mt-2">
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-indigo-900">Quantidade de Linhas em Branco</label>
                              <input 
                                type="number" min="1"
                                className="w-full border border-indigo-200 p-2 rounded text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                value={components[selectedComponentIndex].elements[selectedElementIndex].blankLinesCount || 1}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].blankLinesCount = parseInt(e.target.value);
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {components[selectedComponentIndex].elements[selectedElementIndex].type === 'BOLD_LABELED_KEYWORDS' && (
                          <div className="grid grid-cols-3 gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg mt-2">
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-indigo-900">Label (ex: Palavras-chave:)</label>
                              <input 
                                type="text" 
                                className="w-full border border-indigo-200 p-2 rounded text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                value={components[selectedComponentIndex].elements[selectedElementIndex].keywordsLabel || 'Palavras-chave:'}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].keywordsLabel = e.target.value;
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-indigo-900">Separador (ex: ; )</label>
                              <input 
                                type="text" 
                                className="w-full border border-indigo-200 p-2 rounded text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                value={components[selectedComponentIndex].elements[selectedElementIndex].keywordsSeparator || '; '}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].keywordsSeparator = e.target.value;
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-indigo-900">Terminador (ex: .)</label>
                              <input 
                                type="text" 
                                className="w-full border border-indigo-200 p-2 rounded text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                value={components[selectedComponentIndex].elements[selectedElementIndex].keywordsTerminator || '.'}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].keywordsTerminator = e.target.value;
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {components[selectedComponentIndex].elements[selectedElementIndex].type === 'TABLE_BLOCK' && (
                          <div className="grid grid-cols-1 gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg mt-2">
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-indigo-900">Cabeçalhos da Tabela Fixo (separados por vírgula)</label>
                              <input 
                                type="text" 
                                className="w-full border border-indigo-200 p-2 rounded text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                placeholder="Folha, Linha, Onde se lê, Leia-se"
                                value={components[selectedComponentIndex].elements[selectedElementIndex].tableHeaders || ''}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].tableHeaders = e.target.value;
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Posicionamento Horizontal */}
                      <div className="pt-4 border-t border-slate-100 space-y-4">
                        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Posicionamento na Página</h5>
                        
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-600">Área Horizontal Ocupada</label>
                          <select 
                            className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500"
                            value={components[selectedComponentIndex].elements[selectedElementIndex].horizontalPlacement || 'FULL_CONTENT_WIDTH'}
                            onChange={e => {
                              const newComps = [...components];
                              newComps[selectedComponentIndex].elements[selectedElementIndex].horizontalPlacement = e.target.value;
                              setComponents(newComps);
                            }}
                          >
                            <option value="FULL_CONTENT_WIDTH">Toda a largura útil da página</option>
                            <option value="FROM_PAGE_CENTER_TO_RIGHT_MARGIN">Do centro da folha até a margem direita (Ex: Folha de Rosto, Epígrafe)</option>
                            <option value="CUSTOM">Personalizado (Definir recuos absolutos)</option>
                          </select>
                        </div>
                        
                        {components[selectedComponentIndex].elements[selectedElementIndex].horizontalPlacement === 'CUSTOM' && (
                          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-600">Margem Esquerda do Bloco (cm)</label>
                              <input 
                                type="number" step="0.5" min="0"
                                className="w-full border border-slate-300 p-2 rounded text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                value={components[selectedComponentIndex].elements[selectedElementIndex].customLeftMarginCm || 0}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].customLeftMarginCm = Number(e.target.value);
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-600">Margem Direita do Bloco (cm)</label>
                              <input 
                                type="number" step="0.5" min="0"
                                className="w-full border border-slate-300 p-2 rounded text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                value={components[selectedComponentIndex].elements[selectedElementIndex].customRightMarginCm || 0}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].customRightMarginCm = Number(e.target.value);
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Estilo Visual */}
                      <div className="pt-4 border-t border-slate-100 space-y-4">
                        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estilo Visual (StyleMapping)</h5>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold mb-1 text-slate-600">Alinhamento</label>
                            <select 
                              className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500"
                              value={components[selectedComponentIndex].elements[selectedElementIndex].alignment || 'inherit'}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].elements[selectedElementIndex].alignment = e.target.value;
                                setComponents(newComps);
                              }}
                            >
                              <option value="inherit">Herdar Padrão</option>
                              <option value="left">Esquerda</option>
                              <option value="center">Centralizado</option>
                              <option value="right">Direita</option>
                              <option value="justify">Justificado</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1 text-slate-600">Fonte (pt)</label>
                            <select 
                              className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500"
                              value={components[selectedComponentIndex].elements[selectedElementIndex].fontSize || 'inherit'}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].elements[selectedElementIndex].fontSize = e.target.value;
                                setComponents(newComps);
                              }}
                            >
                              <option value="inherit">Herdar</option>
                              <option value="10">10 pt</option>
                              <option value="12">12 pt</option>
                              <option value="14">14 pt</option>
                              <option value="16">16 pt</option>
                              <option value="18">18 pt</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-4 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={components[selectedComponentIndex].elements[selectedElementIndex].uppercase || false}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].elements[selectedElementIndex].uppercase = e.target.checked;
                                setComponents(newComps);
                              }}
                              className="text-indigo-600 rounded border-slate-300"
                            />
                            <span className="text-xs font-bold text-slate-700 uppercase">AA</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={components[selectedComponentIndex].elements[selectedElementIndex].bold || false}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].elements[selectedElementIndex].bold = e.target.checked;
                                setComponents(newComps);
                              }}
                              className="text-indigo-600 rounded border-slate-300"
                            />
                            <span className="text-xs font-bold text-slate-700">B</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={components[selectedComponentIndex].elements[selectedElementIndex].italic || false}
                              onChange={e => {
                                const newComps = [...components];
                                newComps[selectedComponentIndex].elements[selectedElementIndex].italic = e.target.checked;
                                setComponents(newComps);
                              }}
                              className="text-indigo-600 rounded border-slate-300"
                            />
                            <span className="text-xs italic font-serif font-bold text-slate-700">I</span>
                          </label>
                        </div>
                      </div>

                      {/* Espaçamento Específico do SINGLE_PAGE */}
                      {components[selectedComponentIndex].layoutMode === 'SINGLE_PAGE' && (
                        <div className="pt-4 border-t border-slate-100 space-y-4">
                          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Espaçamento Vertical Flexível</h5>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-600">Força de Espaçamento Abaixo</label>
                              <input 
                                type="number" min="0"
                                className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                value={components[selectedComponentIndex].elements[selectedElementIndex].gapWeight ?? 10}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].gapWeight = parseInt(e.target.value);
                                  setComponents(newComps);
                                }}
                              />
                              <p className="text-[10px] text-slate-500 mt-1">Valor relativo de 1 a 100. Valores maiores empurram os próximos blocos mais para baixo.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Espaçamento Padrão */}
                      {components[selectedComponentIndex].layoutMode !== 'SINGLE_PAGE' && (
                        <div className="pt-4 border-t border-slate-100 space-y-4">
                          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Espaçamento Vertical (cm)</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-600">Antes</label>
                              <input 
                                type="number" step="0.1"
                                className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                value={components[selectedComponentIndex].elements[selectedElementIndex].marginTop ?? '0'}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].marginTop = e.target.value;
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-600">Depois</label>
                              <input 
                                type="number" step="0.1"
                                className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                value={components[selectedComponentIndex].elements[selectedElementIndex].marginBottom ?? '1'}
                                onChange={e => {
                                  const newComps = [...components];
                                  newComps[selectedComponentIndex].elements[selectedElementIndex].marginBottom = e.target.value;
                                  setComponents(newComps);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 mt-2">
                        <button 
                          onClick={() => {
                            const newComps = [...components];
                            newComps[selectedComponentIndex].elements.splice(selectedElementIndex, 1);
                            setComponents(newComps);
                            setSelectedElementIndex(null);
                          }}
                          className="w-full py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                        >
                          Excluir Elemento
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedComponentIndex === null && (
                    <div className="text-sm text-slate-400 text-center mt-10">
                      Selecione um componente ou elemento para inspecionar e alterar suas configurações.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 mt-4 border-t">
              <button onClick={() => setStep(1)} className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-300 transition">&larr; Anterior</button>
              <button onClick={() => setStep(3)} className="bg-slate-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-900 transition">Próximo Passo &rarr;</button>
            </div>
          </div>
        )}

        {/* --- PASSO 3: ELEMENTOS TEXTUAIS --- */}
        {step === 3 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border animate-in fade-in slide-in-from-right-4 duration-500 min-h-[60vh]">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Configuração de Elementos Textuais</h2>
            <p className="text-sm text-slate-500 mb-6">
              Configure o formato dos elementos dinâmicos que podem aparecer no corpo do texto do seu trabalho. 
              Estas regras definem como tabelas, citações e imagens se comportarão <b>se</b> o usuário enviá-las.
            </p>
            
            <div className="flex min-h-[400px] border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
              <div className="w-64 border-r border-slate-200 bg-white">
                <ul className="divide-y divide-slate-100">
                  <li onClick={() => setTextualTab('CITATIONS')} className={`p-4 cursor-pointer hover:bg-slate-50 ${textualTab === 'CITATIONS' ? 'bg-blue-50 border-l-2 border-blue-600' : ''}`}>
                    <span className={`font-semibold text-sm ${textualTab === 'CITATIONS' ? 'text-blue-800' : 'text-slate-700'}`}>Citações e Referências</span>
                  </li>
                  <li onClick={() => setTextualTab('FIGURES')} className={`p-4 cursor-pointer hover:bg-slate-50 ${textualTab === 'FIGURES' ? 'bg-blue-50 border-l-2 border-blue-600' : ''}`}>
                    <span className={`font-semibold text-sm ${textualTab === 'FIGURES' ? 'text-blue-800' : 'text-slate-700'}`}>Figuras e Imagens</span>
                  </li>
                  <li onClick={() => setTextualTab('TABLES')} className={`p-4 cursor-pointer hover:bg-slate-50 ${textualTab === 'TABLES' ? 'bg-blue-50 border-l-2 border-blue-600' : ''}`}>
                    <span className={`font-semibold text-sm ${textualTab === 'TABLES' ? 'text-blue-800' : 'text-slate-700'}`}>Tabelas e Quadros</span>
                  </li>
                  <li onClick={() => setTextualTab('CHARTS')} className={`p-4 cursor-pointer hover:bg-slate-50 ${textualTab === 'CHARTS' ? 'bg-blue-50 border-l-2 border-blue-600' : ''}`}>
                    <span className={`font-semibold text-sm ${textualTab === 'CHARTS' ? 'text-blue-800' : 'text-slate-700'}`}>Gráficos</span>
                  </li>
                  <li onClick={() => setTextualTab('EQUATIONS')} className={`p-4 cursor-pointer hover:bg-slate-50 ${textualTab === 'EQUATIONS' ? 'bg-blue-50 border-l-2 border-blue-600' : ''}`}>
                    <span className={`font-semibold text-sm ${textualTab === 'EQUATIONS' ? 'text-blue-800' : 'text-slate-700'}`}>Equações</span>
                  </li>
                  <li onClick={() => setTextualTab('CODE')} className={`p-4 cursor-pointer hover:bg-slate-50 ${textualTab === 'CODE' ? 'bg-blue-50 border-l-2 border-blue-600' : ''}`}>
                    <span className={`font-semibold text-sm ${textualTab === 'CODE' ? 'text-blue-800' : 'text-slate-700'}`}>Código Fonte</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1 p-6 bg-white overflow-y-auto">
                {textualTab === 'CITATIONS' && (
                  <div className="space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">Citações Diretas Longas</h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700">Recuo da Margem Esquerda (cm)</label>
                          <input type="number" step="0.5" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={longCitationIndentCm} onChange={e => setLongCitationIndentCm(Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700">Tamanho da Fonte (pt)</label>
                          <input type="number" step="0.5" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={longCitationFontSizePt} onChange={e => setLongCitationFontSizePt(Number(e.target.value))} />
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-800 mb-2 border-t pt-4">Conectores e Rótulos (Formatação de Citação)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-700">Prefixo de Página</label>
                          <input type="text" className="w-full border border-slate-300 p-2 rounded text-sm bg-slate-50" value={citPagePrefix} onChange={e => setCitPagePrefix(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-700">Separador Multi-autor</label>
                          <input type="text" className="w-full border border-slate-300 p-2 rounded text-sm bg-slate-50" value={citMultiAuthorJoiner} onChange={e => setCitMultiAuthorJoiner(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-700">Marcador et al.</label>
                          <input type="text" className="w-full border border-slate-300 p-2 rounded text-sm bg-slate-50" value={citEtAl} onChange={e => setCitEtAl(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-700">Conector apud</label>
                          <input type="text" className="w-full border border-slate-300 p-2 rounded text-sm bg-slate-50" value={citApudConnector} onChange={e => setCitApudConnector(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-700">Supressão de texto</label>
                          <input type="text" className="w-full border border-slate-300 p-2 rounded text-sm bg-slate-50" value={citSuppressionMarker} onChange={e => setCitSuppressionMarker(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-700">Rótulo Info. Verbal</label>
                          <input type="text" className="w-full border border-slate-300 p-2 rounded text-sm bg-slate-50" value={citVerbalCitationLabel} onChange={e => setCitVerbalCitationLabel(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-700">Grifo Nosso</label>
                          <input type="text" className="w-full border border-slate-300 p-2 rounded text-sm bg-slate-50" value={citEmphasisOursLabel} onChange={e => setCitEmphasisOursLabel(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-700">Grifo do Autor</label>
                          <input type="text" className="w-full border border-slate-300 p-2 rounded text-sm bg-slate-50" value={citEmphasisAuthorLabel} onChange={e => setCitEmphasisAuthorLabel(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {textualTab === 'FIGURES' && (
                  <div className="space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">Configuração de Figuras</h3>
                      <p className="text-sm text-slate-500 mb-4">Templates para geração automática de legendas e posicionamento de imagens.</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700">Template de Legenda Superior</label>
                          <input 
                            type="text" 
                            className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" 
                            value={figCaptionTemplate}
                            onChange={e => setFigCaptionTemplate(e.target.value)}
                          />
                          <p className="text-xs text-slate-500 mt-1">Variáveis disponíveis: &#123;num&#125; (Número), &#123;title&#125; (Título providenciado)</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700">Template de Fonte Inferior</label>
                          <input 
                            type="text" 
                            className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" 
                            value={figSourceTemplate}
                            onChange={e => setFigSourceTemplate(e.target.value)}
                          />
                          <p className="text-xs text-slate-500 mt-1">Variáveis disponíveis: &#123;source&#125;</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700">Alinhamento da Imagem</label>
                          <select 
                            className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
                            value={figAlignment}
                            onChange={e => setFigAlignment(e.target.value)}
                          >
                            <option value="CENTER">Centralizado</option>
                            <option value="LEFT">Esquerda</option>
                            <option value="RIGHT">Direita</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-1 text-slate-700">Tamanho da Fonte das Legendas (pt)</label>
                            <input type="number" step="0.5" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={figFontSizePt} onChange={e => setFigFontSizePt(Number(e.target.value))} />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1 text-slate-700">Estratégia de Numeração</label>
                            <select className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={figNumberingStrategy} onChange={e => setFigNumberingStrategy(e.target.value)}>
                              <option value="GLOBAL_SEQUENTIAL">Global Sequencial (ex: 1, 2, 3)</option>
                              <option value="BY_CHAPTER">Por Capítulo (ex: 1-1, 1-2)</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-1 text-slate-700">Largura Máx. da Imagem (cm)</label>
                            <input type="number" step="0.5" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={figMaxWidthCm} onChange={e => setFigMaxWidthCm(Number(e.target.value))} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {textualTab === 'TABLES' && (
                  <div className="space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">Configuração de Tabelas</h3>
                      <p className="text-sm text-slate-500 mb-4">Templates e comportamento para dados tabulares.</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700">Template de Título</label>
                          <input 
                            type="text" 
                            className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" 
                            value={tableCaptionTemplate}
                            onChange={e => setTableCaptionTemplate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700">Template de Fonte</label>
                          <input 
                            type="text" 
                            className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" 
                            value={tableSourceTemplate}
                            onChange={e => setTableSourceTemplate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700">Alinhamento da Tabela na Página</label>
                          <select 
                            className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
                            value={tableAlignment}
                            onChange={e => setTableAlignment(e.target.value)}
                          >
                            <option value="CENTER">Centralizado</option>
                            <option value="LEFT">Esquerda</option>
                            <option value="RIGHT">Direita</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-1 text-slate-700">Tamanho da Fonte (pt)</label>
                            <input type="number" step="0.5" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={tableFontSizePt} onChange={e => setTableFontSizePt(Number(e.target.value))} />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1 text-slate-700">Estratégia de Numeração</label>
                            <select className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={tableNumberingStrategy} onChange={e => setTableNumberingStrategy(e.target.value)}>
                              <option value="GLOBAL_SEQUENTIAL">Global Sequencial</option>
                              <option value="BY_CHAPTER">Por Capítulo</option>
                            </select>
                          </div>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer mt-2">
                          <input type="checkbox" checked={tableRepeatHeader} onChange={e => setTableRepeatHeader(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                          <span className="text-sm font-medium text-slate-700">Repetir cabeçalho em quebra de página</span>
                        </label>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800 mb-2 border-t pt-6 mt-6">Configuração de Quadros (Frames)</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700">Template de Título</label>
                          <input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={frameCaptionTemplate} onChange={e => setFrameCaptionTemplate(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700">Template de Fonte</label>
                          <input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={frameSourceTemplate} onChange={e => setFrameSourceTemplate(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700">Alinhamento na Página</label>
                          <select className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={frameAlignment} onChange={e => setFrameAlignment(e.target.value)}>
                            <option value="CENTER">Centralizado</option>
                            <option value="LEFT">Esquerda</option>
                            <option value="RIGHT">Direita</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-1 text-slate-700">Tamanho da Fonte (pt)</label>
                            <input type="number" step="0.5" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={frameFontSizePt} onChange={e => setFrameFontSizePt(Number(e.target.value))} />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1 text-slate-700">Estratégia de Numeração</label>
                            <select className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={frameNumberingStrategy} onChange={e => setFrameNumberingStrategy(e.target.value)}>
                              <option value="GLOBAL_SEQUENTIAL">Global Sequencial</option>
                              <option value="BY_CHAPTER">Por Capítulo</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {textualTab === 'CODE' && (
                  <div className="space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">Listagens de Código</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700">Template de Título</label>
                          <input 
                            type="text" 
                            className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" 
                            value={codeCaptionTemplate}
                            onChange={e => setCodeCaptionTemplate(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-1 text-slate-700">Família de Fonte do Código</label>
                            <input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={codeFontFamily} onChange={e => setCodeFontFamily(e.target.value)} placeholder="ex: Consolas, Courier New" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1 text-slate-700">Tamanho da Fonte (pt)</label>
                            <input type="number" step="0.5" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={codeFontSizePt} onChange={e => setCodeFontSizePt(Number(e.target.value))} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-1 text-slate-700">Estratégia de Numeração</label>
                            <select className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={codeNumberingStrategy} onChange={e => setCodeNumberingStrategy(e.target.value)}>
                              <option value="GLOBAL_SEQUENTIAL">Global Sequencial</option>
                              <option value="BY_CHAPTER">Por Capítulo</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {textualTab === 'CHARTS' && (
                  <div className="space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">Configuração de Gráficos</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700">Template de Título</label>
                          <input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={chartCaptionTemplate} onChange={e => setChartCaptionTemplate(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700">Template de Fonte</label>
                          <input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={chartSourceTemplate} onChange={e => setChartSourceTemplate(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700">Alinhamento do Gráfico</label>
                          <select className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={chartAlignment} onChange={e => setChartAlignment(e.target.value)}>
                            <option value="CENTER">Centralizado</option>
                            <option value="LEFT">Esquerda</option>
                            <option value="RIGHT">Direita</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-1 text-slate-700">Tamanho da Fonte (pt)</label>
                            <input type="number" step="0.5" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={chartFontSizePt} onChange={e => setChartFontSizePt(Number(e.target.value))} />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1 text-slate-700">Estratégia de Numeração</label>
                            <select className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={chartNumberingStrategy} onChange={e => setChartNumberingStrategy(e.target.value)}>
                              <option value="GLOBAL_SEQUENTIAL">Global Sequencial</option>
                              <option value="BY_CHAPTER">Por Capítulo</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {textualTab === 'EQUATIONS' && (
                  <div className="space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">Equações Matemáticas</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700">Template Numerador</label>
                          <input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={eqCaptionTemplate} onChange={e => setEqCaptionTemplate(e.target.value)} />
                          <p className="text-xs text-slate-500 mt-1">Geralmente, equações usam "(&#123;num&#125;)" do lado direito.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-1 text-slate-700">Alinhamento da Equação</label>
                            <select className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={eqAlignment} onChange={e => setEqAlignment(e.target.value)}>
                              <option value="CENTER">Centralizado</option>
                              <option value="LEFT">Esquerda</option>
                              <option value="RIGHT">Direita</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1 text-slate-700">Estratégia de Numeração</label>
                            <select className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500" value={eqNumberingStrategy} onChange={e => setEqNumberingStrategy(e.target.value)}>
                              <option value="GLOBAL_SEQUENTIAL">Global Sequencial</option>
                              <option value="BY_CHAPTER">Por Capítulo</option>
                            </select>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t mt-6">
              <button onClick={() => setStep(2)} className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-300 transition">&larr; Anterior</button>
              <button onClick={() => setStep(4)} className="bg-slate-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-900 transition">Próximo Passo &rarr;</button>
            </div>
          </div>
        )}

        {/* --- PASSO 4: NUMERAÇÃO --- */}
        {step === 4 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto">
            <div>
              <div className="flex items-center justify-between mb-6 border-b pb-2">
                <h2 className="text-xl font-bold text-slate-800">Numeração de Páginas</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={pageNumberingEnabled} onChange={e => setPageNumberingEnabled(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                  <span className="font-medium text-slate-700">Habilitar Numeração</span>
                </label>
              </div>
              
              {!pageNumberingEnabled ? (
                <div className="p-8 text-center text-slate-500 border border-slate-100 rounded-lg bg-slate-50">
                  A numeração de páginas está desabilitada para este perfil.
                </div>
              ) : components.length === 0 ? (
                <div className="p-8 text-center text-red-500 border border-red-100 rounded-lg bg-red-50">
                  Você precisa criar componentes na aba anterior (Construtor) antes de configurar a numeração.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-lg border border-slate-100">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Contar a partir de</label>
                    <select className="w-full border-slate-300 border p-3 rounded-lg text-slate-800 bg-white" value={countFromComponentId} onChange={e => setCountFromComponentId(e.target.value)}>
                      {components.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Primeira página será o número 1.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Visível a partir de</label>
                    <select className="w-full border-slate-300 border p-3 rounded-lg text-slate-800 bg-white" value={visibleFromComponentId} onChange={e => setVisibleFromComponentId(e.target.value)}>
                      {components.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Onde o número passa a ser impresso na folha.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Posição</label>
                    <select className="w-full border-slate-300 border p-3 rounded-lg text-slate-800 bg-white" value={pageNumberingPlacement} onChange={e => setPageNumberingPlacement(e.target.value)}>
                      <option value="HEADER_RIGHT">Cabeçalho Direito</option>
                      <option value="HEADER_CENTER">Cabeçalho Central</option>
                      <option value="FOOTER_RIGHT">Rodapé Direito</option>
                      <option value="FOOTER_CENTER">Rodapé Central</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Dist. Vertical (cm)</label>
                      <input type="number" step="0.1" className="w-full border-slate-300 border p-2 rounded text-slate-800" value={vertDistCm} onChange={e => setVertDistCm(Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Dist. Horizontal (cm)</label>
                      <input type="number" step="0.1" className="w-full border-slate-300 border p-2 rounded text-slate-800" value={horizDistCm} onChange={e => setHorizDistCm(Number(e.target.value))} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t mt-8">
              <button onClick={() => setStep(3)} className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-300 transition">&larr; Anterior</button>
              <button onClick={() => setStep(5)} className="bg-slate-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-900 transition">Próximo Passo &rarr;</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Pós-processamento e Validações</h2>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-lg border border-slate-100">
                <h3 className="font-semibold text-slate-800">Verificações de Integridade</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={integrityEnabled} onChange={e => setIntegrityEnabled(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-slate-300" />
                  <span className="font-medium text-slate-700">Habilitar Verificação (Avisos no Header HTTP)</span>
                </label>
                {integrityEnabled && (
                  <div className="ml-8 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={marginOverflowCheck} onChange={e => setMarginOverflowCheck(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                      <span className="text-sm text-slate-600">Verificar Overflow de Margens (Elementos saindo da página)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={fontSubCheck} onChange={e => setFontSubCheck(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                      <span className="text-sm text-slate-600">Verificar Substituição de Fontes</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-600">Limite máximo de páginas:</span>
                      <input type="number" className="border border-slate-300 rounded p-1 w-24 text-sm" value={maxPages} onChange={e => setMaxPages(Number(e.target.value))} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-lg border border-slate-100">
                <h3 className="font-semibold text-slate-800">Tabelas Longas</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={tableContLabelsEnabled} onChange={e => setTableContLabelsEnabled(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-slate-300" />
                  <span className="font-medium text-slate-700">Injetar rótulos em tabelas que quebram de página</span>
                </label>
                {tableContLabelsEnabled && (
                  <div className="ml-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Rótulo Inicial</label>
                      <input type="text" className="w-full border border-slate-300 rounded p-2 text-sm" value={continuesLabel} onChange={e => setContinuesLabel(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Rótulo Intermediário</label>
                      <input type="text" className="w-full border border-slate-300 rounded p-2 text-sm" value={continuationLabel} onChange={e => setContinuationLabel(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Rótulo Final</label>
                      <input type="text" className="w-full border border-slate-300 rounded p-2 text-sm" value={conclusionLabel} onChange={e => setConclusionLabel(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 flex flex-col justify-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={orphanTitleEnabled} onChange={e => setOrphanTitleEnabled(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-slate-300" />
                    <span className="font-medium text-slate-700">Correção de Títulos Órfãos</span>
                  </label>
                  <p className="text-xs text-slate-500 mt-2 ml-8">Move títulos isolados no fim da página para a página seguinte automaticamente.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 flex flex-col justify-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={pdfOutputEnabled} onChange={e => setPdfOutputEnabled(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-slate-300" />
                    <span className="font-medium text-slate-700">Exportar PDF simultâneo</span>
                  </label>
                  <p className="text-xs text-slate-500 mt-2 ml-8">Gera um arquivo PDF além do DOCX padrão.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <button onClick={() => setStep(4)} className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-300 transition">&larr; Anterior</button>
              <button onClick={handleSaveProfile} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Finalizar e Salvar Perfil</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
