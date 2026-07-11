// Serializer bidirecional: BuilderState ↔ contrato JSON do Formatter-service

export type StyleRuleType =
  | 'PARAGRAPH'
  | 'HEADING_1'
  | 'HEADING_2'
  | 'HEADING_3'
  | 'HEADING_4'
  | 'HEADING_5'
  | 'HEADING_6'
  | 'CHARACTER';

export interface StyleRule {
  id: string;
  type: StyleRuleType;
  fontFamily: string;
  fontSizePt: number;
  alignment: 'JUSTIFIED' | 'LEFT' | 'CENTER' | 'RIGHT';
  lineSpacing: number;
  firstLineIndentCm: number;
  leftIndentCm: number;
  rightIndentCm: number;
  spacingBeforePt: number;
  spacingAfterPt: number;
  bold: boolean;
  italic: boolean;
  uppercase: boolean;
}

export type SlotType = 'TEXT' | 'TEXT_LIST' | 'COMPOSED_TEXT' | 'SIGNATURE_BLOCK_LIST';

export interface SlotState {
  id: string;
  displayName?: string;
  type: SlotType;
  required: boolean;
  // COMPOSED_TEXT
  template?: string;
  fieldNames?: string[];
  // SIGNATURE_BLOCK_LIST
  signatureLineEnabled?: boolean;
  signatureLineText?: string;
  lineTemplates?: string[];
  // StyleRule inline
  styleId?: string;
  styleRule?: StyleRule;
  // Placement (SINGLE_PAGE)
  horizontalPlacement?: 'FULL_CONTENT_WIDTH' | 'FROM_PAGE_CENTER_TO_RIGHT_MARGIN' | 'CUSTOM';
  customLeftMarginCm?: number;
  customRightMarginCm?: number;
  blankLinesAfter?: number;
  maxVisualLinesPerValue?: number;
  // gapWeight para SINGLE_PAGE (proporcional ao espaço vertical)
  gapWeight?: number;
}

export type ComponentRuleType =
  | 'SINGLE_PAGE'
  | 'FLOW_TEXTUAL'
  | 'BIBLIOGRAPHY'
  | 'BODY_CONTENT'
  | 'SECTIONED'
  | 'ELEMENT_INDEX'
  | 'SECTION_INDEX';

// --- FlowTextual item types ---
export type FlowItemType =
  | 'HEADING'
  | 'BLANK_LINES'
  | 'PLAIN_TEXT'
  | 'TABLE_BLOCK'
  | 'BOLD_LABELED_KEYWORDS'
  | 'PAIR_LIST'
  | 'REPEAT_GROUP';

export interface FlowItem {
  type: FlowItemType;
  styleId?: string;
  // HEADING
  text?: string;
  // BLANK_LINES
  count?: number;
  // PLAIN_TEXT
  slotName?: string;
  // TABLE_BLOCK
  headerStyleId?: string;
  cellStyleId?: string;
  headers?: string[];
  rowsSlotName?: string;
  // BOLD_LABELED_KEYWORDS
  labelSlotName?: string;
  keywordsSlotName?: string;
  separator?: string;
  terminator?: string;
  // PAIR_LIST
  termsSlotName?: string;
  definitionsSlotName?: string;
  // REPEAT_GROUP
  entriesSlotName?: string;
  pageBreakBetweenEntries?: boolean;
  group?: FlowItem[];
}

// --- Bibliography entry part ---
export interface BibEntryPart {
  source: string;
  bold: boolean;
  prefix: string;
  suffix: string;
  optional: boolean;
}

export type BibRefType =
  | 'BOOK'
  | 'BOOK_CHAPTER'
  | 'JOURNAL'
  | 'WEBSITE'
  | 'LEGISLATION'
  | 'THESIS'
  | 'CONFERENCE_PAPER'
  | 'REPORT'
  | 'STANDARD';

// --- BodyContent sub-state ---
export interface BodyContentState {
  numbering: {
    enabled: boolean;
    separator: string;
    primarySuffix: string;
  };
  layout: {
    blankLinesBeforeSectionTitleWhenPrecededByContent: number;
    blankLinesAfterSectionTitle: number;
    pageBreakBeforePrimarySection: boolean;
  };
  citationFormatting: {
    pagePrefix: string;
    multiAuthorJoiner: string;
    etAl: string;
    apudConnector: string;
    suppressionMarker: string;
    emphasisOursLabel: string;
    emphasisAuthorLabel: string;
    verbalCitationLabel: string;
    authorYearSeparator: string;
    pageReferenceSeparator: string;
    parenOpen: string;
    parenClose: string;
    multiSourceSeparator: string;
  };
  crossReferenceLabels: {
    sectionLabel: string;
    figureLabel: string;
    tableLabel: string;
    frameLabel: string;
    chartLabel: string;
    codeListingLabel: string;
    equationLabel: string;
  };
  figure: ElementFormatState;
  table: TableFormatState;
  frame: TableFormatState;
  chart: ElementFormatState;
  codeListing: CodeFormatState;
  equation: EquationFormatState;
  directCitation: DirectCitationState;
  longDirectCitation: LongDirectCitationState;
  footnote: FootnoteState;
  sectionTitleStyleIdsByLevel: string[];
  paragraphStyleId: string;
}

export interface ElementFormatState {
  captionTemplate: string;
  sourceTemplate: string;
  alignment: 'CENTER' | 'LEFT' | 'RIGHT';
  fontSizePt: number;
  numberingStrategy: 'GLOBAL_SEQUENTIAL' | 'BY_CHAPTER';
  label: string;
  maxWidthCm?: number;
  maxHeightCm?: number;
}

export interface TableFormatState extends ElementFormatState {
  widthPercent: number;
  repeatHeaderOnPageBreak: boolean;
}

export interface CodeFormatState {
  captionTemplate: string;
  sourceTemplate: string;
  fontFamily: string;
  fontSizePt: number;
  numberingStrategy: 'GLOBAL_SEQUENTIAL' | 'BY_CHAPTER';
  label: string;
  widthPercent: number;
  repeatHeaderOnPageBreak: boolean;
}

export interface EquationFormatState {
  numberingTemplate: string;
  alignment: 'CENTER' | 'LEFT' | 'RIGHT';
  numberingStrategy: 'GLOBAL_SEQUENTIAL' | 'BY_CHAPTER';
  label: string;
}

export interface DirectCitationState {
  openQuote: string;
  closeQuote: string;
}

export interface LongDirectCitationState {
  leftIndentCm: number;
  rightIndentCm: number;
  fontSizePt: number;
  lineSpacing: number;
  spaceBeforePt: number;
  spaceAfterPt: number;
}

export interface FootnoteState {
  fontSizePt: number;
  lineSpacing: number;
  firstLineIndentCm: number;
  separatorWidthPct: number;
}

// --- Component state ---
export interface ComponentState {
  id: string;
  displayName: string;
  ruleType: ComponentRuleType;
  enabled: boolean;

  // SINGLE_PAGE
  slots?: SlotState[];
  policy?: {
    anchorStrategy: string;
    lineHeightStrategy: string;
    spacerStylePolicy: string;
    safetyPolicy: string;
  };

  // FLOW_TEXTUAL
  flowItems?: FlowItem[];

  // BIBLIOGRAPHY
  headingText?: string;
  blankLinesAfterHeading?: number;
  blankLinesBetweenEntries?: number;
  sortOrder?: 'ALPHABETICAL' | 'NONE';
  authorFormat?: {
    surnameUppercase: boolean;
    surnameGivenSeparator: string;
    nameTerminator: string;
    multiAuthorJoiner: string;
    etAlLabel: string;
    etAlThreshold: number;
  };
  entryFormats?: Partial<Record<BibRefType, BibEntryPart[]>>;

  // BODY_CONTENT (configurado na seção Corpo do Texto)
  bodyContent?: BodyContentState;

  // SECTIONED
  headingTemplate?: string;
  indexingStyle?: 'ALPHABETIC' | 'NUMERIC';
  bodyContentComponentId?: string;
  sectionTitleStyleIdsByLevel?: string[];

  // ELEMENT_INDEX
  elementType?: 'FIGURE' | 'TABLE' | 'FRAME' | 'CHART' | 'CODE_LISTING';
  entryTemplate?: string;
  pageReferenceEnabled?: boolean;

  // SECTION_INDEX
  useTocField?: boolean;
  entryStyleIdsByLevel?: string[];
}

// --- Page state ---
export interface PageState {
  paperFormat: 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | 'Tabloid' | 'Custom';
  widthCm: number;
  heightCm: number;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  marginTopCm: number;
  marginBottomCm: number;
  marginLeftCm: number;
  marginRightCm: number;
  fontRoles: {
    defaultFamily: string;
    allowedFamilies: string[];
  };
  pageNumbering: {
    enabled: boolean;
    placement: 'HEADER_RIGHT' | 'HEADER_CENTER' | 'FOOTER_RIGHT' | 'FOOTER_CENTER';
    countFromComponentId: string;
    visibleFromComponentId: string;
    verticalDistanceFromEdgeCm: number;
    horizontalDistanceFromEdgeCm: number;
  };
}

export interface PostProcessingState {
  orphanTitleEnabled: boolean;
  tableContinuationLabels: {
    enabled: boolean;
    continuesLabel: string;
    continuationLabel: string;
    conclusionLabel: string;
  };
  integrityCheck: {
    enabled: boolean;
    checkMarginOverflow: boolean;
    checkFontSubstitution: boolean;
    maxPages: number;
  };
  pdfOutputEnabled: boolean;
}

export interface BuilderState {
  // Meta
  name: string;
  description: string;
  isPublic: boolean;
  // Page
  page: PageState;
  // Components (ordered)
  components: ComponentState[];
  // Style rules (global pool)
  styleRules: StyleRule[];
  // Post processing
  postProcessing: PostProcessingState;
}

// ──────────────────────────────────────────
// Default values
// ──────────────────────────────────────────

export function defaultStyleRule(id: string, overrides: Partial<StyleRule> = {}): StyleRule {
  return {
    id,
    type: 'PARAGRAPH',
    fontFamily: 'Times New Roman',
    fontSizePt: 12,
    alignment: 'JUSTIFIED',
    lineSpacing: 1.5,
    firstLineIndentCm: 1.25,
    leftIndentCm: 0,
    rightIndentCm: 0,
    spacingBeforePt: 0,
    spacingAfterPt: 0,
    bold: false,
    italic: false,
    uppercase: false,
    ...overrides,
  };
}

export function defaultBuilderState(): BuilderState {
  return {
    name: '',
    description: '',
    isPublic: true,
    page: {
      paperFormat: 'A4',
      widthCm: 21,
      heightCm: 29.7,
      orientation: 'PORTRAIT',
      marginTopCm: 3,
      marginBottomCm: 2,
      marginLeftCm: 3,
      marginRightCm: 2,
      fontRoles: {
        defaultFamily: 'Times New Roman',
        allowedFamilies: ['Times New Roman', 'Arial', 'Calibri'],
      },
      pageNumbering: {
        enabled: true,
        placement: 'HEADER_RIGHT',
        countFromComponentId: '',
        visibleFromComponentId: '',
        verticalDistanceFromEdgeCm: 2,
        horizontalDistanceFromEdgeCm: 2,
      },
    },
    components: [],
    styleRules: [
      defaultStyleRule('bodyContent.paragraph'),
      defaultStyleRule('pageNumber', { type: 'CHARACTER', fontSizePt: 10, lineSpacing: 1.0, firstLineIndentCm: 0 }),
    ],
    postProcessing: {
      orphanTitleEnabled: true,
      tableContinuationLabels: {
        enabled: true,
        continuesLabel: 'continua',
        continuationLabel: 'continuação',
        conclusionLabel: 'conclusão',
      },
      integrityCheck: {
        enabled: true,
        checkMarginOverflow: true,
        checkFontSubstitution: true,
        maxPages: 500,
      },
      pdfOutputEnabled: false,
    },
  };
}

export function defaultBodyContentState(): BodyContentState {
  return {
    numbering: { enabled: true, separator: '.', primarySuffix: '' },
    layout: {
      blankLinesBeforeSectionTitleWhenPrecededByContent: 1,
      blankLinesAfterSectionTitle: 1,
      pageBreakBeforePrimarySection: true,
    },
    citationFormatting: {
      pagePrefix: 'p.',
      multiAuthorJoiner: '; ',
      etAl: ' et al.',
      apudConnector: ' apud ',
      suppressionMarker: '[...]',
      emphasisOursLabel: 'grifo nosso',
      emphasisAuthorLabel: 'grifo do autor',
      verbalCitationLabel: 'informação verbal',
      authorYearSeparator: ', ',
      pageReferenceSeparator: ', ',
      parenOpen: '(',
      parenClose: ')',
      multiSourceSeparator: '; ',
    },
    crossReferenceLabels: {
      sectionLabel: 'Seção',
      figureLabel: 'Figura',
      tableLabel: 'Tabela',
      frameLabel: 'Quadro',
      chartLabel: 'Gráfico',
      codeListingLabel: 'Listagem',
      equationLabel: 'Equação',
    },
    figure: {
      captionTemplate: 'Figura {num} – {title}',
      sourceTemplate: 'Fonte: {source}',
      alignment: 'CENTER',
      fontSizePt: 10,
      numberingStrategy: 'GLOBAL_SEQUENTIAL',
      label: 'Figura',
      maxWidthCm: 16,
      maxHeightCm: 20,
    },
    table: {
      captionTemplate: 'Tabela {num} – {title}',
      sourceTemplate: 'Fonte: {source}',
      alignment: 'CENTER',
      fontSizePt: 10,
      numberingStrategy: 'GLOBAL_SEQUENTIAL',
      label: 'Tabela',
      maxWidthCm: 16,
      widthPercent: 100,
      repeatHeaderOnPageBreak: true,
    },
    frame: {
      captionTemplate: 'Quadro {num} – {title}',
      sourceTemplate: 'Fonte: {source}',
      alignment: 'CENTER',
      fontSizePt: 10,
      numberingStrategy: 'GLOBAL_SEQUENTIAL',
      label: 'Quadro',
      maxWidthCm: 16,
      widthPercent: 100,
      repeatHeaderOnPageBreak: false,
    },
    chart: {
      captionTemplate: 'Gráfico {num} – {title}',
      sourceTemplate: 'Fonte: {source}',
      alignment: 'CENTER',
      fontSizePt: 10,
      numberingStrategy: 'GLOBAL_SEQUENTIAL',
      label: 'Gráfico',
      maxWidthCm: 16,
      maxHeightCm: 20,
    },
    codeListing: {
      captionTemplate: 'Listagem {num} – {title}',
      sourceTemplate: 'Fonte: {source}',
      fontFamily: 'Courier New',
      fontSizePt: 10,
      numberingStrategy: 'GLOBAL_SEQUENTIAL',
      label: 'Listagem',
      widthPercent: 100,
      repeatHeaderOnPageBreak: false,
    },
    equation: {
      numberingTemplate: '({num})',
      alignment: 'CENTER',
      numberingStrategy: 'GLOBAL_SEQUENTIAL',
      label: 'Equação',
    },
    directCitation: {
      openQuote: '“',
      closeQuote: '”',
    },
    longDirectCitation: {
      leftIndentCm: 4,
      rightIndentCm: 0,
      fontSizePt: 10,
      lineSpacing: 1.0,
      spaceBeforePt: 0,
      spaceAfterPt: 0,
    },
    footnote: {
      fontSizePt: 10,
      lineSpacing: 1.0,
      firstLineIndentCm: 0,
      separatorWidthPct: 33,
    },
    sectionTitleStyleIdsByLevel: [
      'bodyContent.heading1',
      'bodyContent.heading2',
      'bodyContent.heading3',
      'bodyContent.heading4',
      'bodyContent.heading5',
      'bodyContent.heading6',
    ],
    paragraphStyleId: 'bodyContent.paragraph',
  };
}

// ──────────────────────────────────────────
// Serializer: BuilderState → contrato JSON
// ──────────────────────────────────────────

function serializeSinglePage(comp: ComponentState, styleRules: StyleRule[]): Record<string, unknown> {
  const slots: Record<string, unknown> = {};
  const styleMapping: Record<string, string> = {};
  const groups: unknown[] = [];
  const gapRules: unknown[] = [];

  const compSlots = comp.slots ?? [];
  compSlots.forEach((slot, idx) => {
    slots[slot.id] = {
      type: slot.type,
      required: slot.required,
      ...(slot.type === 'COMPOSED_TEXT' && {
        template: slot.template ?? '',
        fieldNames: slot.fieldNames ?? [],
      }),
      ...(slot.type === 'SIGNATURE_BLOCK_LIST' && {
        signatureLineEnabled: slot.signatureLineEnabled ?? true,
        signatureLineText: slot.signatureLineText ?? '________________________________________',
        lineTemplates: slot.lineTemplates ?? ['{title} {name}', '{institutionName}', '{role}'],
      }),
    };

    const sId = slot.styleId ?? `${comp.id}.${slot.id}`;
    styleMapping[slot.id] = sId;

    const groupId = `${comp.id}.${slot.id}Block`;
    groups.push({
      id: groupId,
      required: slot.required,
      items: [{
        id: slot.id,
        required: slot.required,
        horizontalPlacement: slot.horizontalPlacement === 'CUSTOM'
          ? { strategy: 'CUSTOM_MARGINS', leftMarginCm: slot.customLeftMarginCm ?? 0, rightMarginCm: slot.customRightMarginCm ?? 0 }
          : { strategy: slot.horizontalPlacement ?? 'FULL_CONTENT_WIDTH' },
        blankLinesAfter: slot.blankLinesAfter ?? 0,
        ...(slot.maxVisualLinesPerValue !== undefined && { maxVisualLinesPerValue: slot.maxVisualLinesPerValue }),
      }],
    });

    if (idx > 0) {
      const prevSlot = compSlots[idx - 1];
      gapRules.push({
        fromGroupId: `${comp.id}.${prevSlot.id}Block`,
        toGroupId: groupId,
        weight: prevSlot.gapWeight ?? 10,
      });
    }
  });

  return {
    componentId: comp.id,
    slots,
    styleMapping,
    layoutRule: {
      groups,
      gapRules,
      policy: comp.policy ?? {
        anchorStrategy: 'LAST_GROUP_AT_SAFE_AREA_END',
        lineHeightStrategy: 'MAX_EXACT_LINE_HEIGHT',
        spacerStylePolicy: 'NEXT_GROUP_STYLE',
        safetyPolicy: 'MARGIN_BASED',
      },
    },
  };
}

function serializeBodyContent(comp: ComponentState): Record<string, unknown> {
  const bc = comp.bodyContent ?? defaultBodyContentState();
  return {
    componentId: comp.id,
    styleMapping: {
      sectionTitleStyleIdsByLevel: bc.sectionTitleStyleIdsByLevel,
      paragraphStyleId: bc.paragraphStyleId,
      directShortQuoteStyleId: bc.paragraphStyleId,
      directLongQuoteStyleId: 'bodyContent.longQuote',
      indirectCitationStyleId: bc.paragraphStyleId,
      citationOfCitationStyleId: bc.paragraphStyleId,
      listOrderedStyleId: 'bodyContent.list.ordered',
      listUnorderedStyleId: 'bodyContent.list.unordered',
      equationStyleId: bc.paragraphStyleId,
      footnoteCallStyleId: 'bodyContent.footnoteCall',
      footnoteTextStyleId: 'bodyContent.footnoteText',
    },
    numbering: bc.numbering,
    layout: { ...bc.layout, blankLineStyleId: bc.paragraphStyleId },
    citationFormatting: bc.citationFormatting,
    crossReferenceLabels: bc.crossReferenceLabels,
    figure: {
      captionStyleId: 'bodyContent.figure.caption',
      sourceStyleId: 'bodyContent.figure.source',
      captionTemplate: bc.figure.captionTemplate,
      sourceTemplate: bc.figure.sourceTemplate,
      continuationLabels: {
        first: bc.table.captionTemplate.includes('continua') ? 'continua' : 'continua',
        middle: 'continuação',
        last: 'conclusão',
      },
      sourcePlacement: 'LAST_PART_ONLY',
      imageAlignment: bc.figure.alignment,
      maxWidthCm: bc.figure.maxWidthCm ?? 16,
      maxHeightCm: bc.figure.maxHeightCm ?? 20,
      defaultDpi: 96,
      maxImageBytes: 2000000,
      urlFetchTimeoutSeconds: 10,
      fitPolicy: 'SCALE_DOWN_PRESERVE_ASPECT_RATIO',
      numberingStrategy: bc.figure.numberingStrategy,
      label: bc.figure.label,
    },
    table: {
      captionStyleId: 'bodyContent.table.caption',
      sourceStyleId: 'bodyContent.table.source',
      headerStyleId: 'bodyContent.table.header',
      cellStyleId: 'bodyContent.table.cell',
      captionTemplate: bc.table.captionTemplate,
      sourceTemplate: bc.table.sourceTemplate,
      continuationLabels: { first: 'continua', middle: 'continuação', last: 'conclusão' },
      sourcePlacement: 'LAST_PART_ONLY',
      tableAlignment: bc.table.alignment,
      widthPercent: bc.table.widthPercent,
      repeatHeaderOnPageBreak: bc.table.repeatHeaderOnPageBreak,
      numberingStrategy: bc.table.numberingStrategy,
      label: bc.table.label,
    },
    frame: {
      captionStyleId: 'bodyContent.frame.caption',
      sourceStyleId: 'bodyContent.frame.source',
      headerStyleId: 'bodyContent.frame.header',
      cellStyleId: 'bodyContent.frame.cell',
      captionTemplate: bc.frame.captionTemplate,
      sourceTemplate: bc.frame.sourceTemplate,
      continuationLabels: { first: 'continua', middle: 'continuação', last: 'conclusão' },
      sourcePlacement: 'LAST_PART_ONLY',
      tableAlignment: bc.frame.alignment,
      widthPercent: bc.frame.widthPercent,
      repeatHeaderOnPageBreak: bc.frame.repeatHeaderOnPageBreak,
      numberingStrategy: bc.frame.numberingStrategy,
      label: bc.frame.label,
    },
    codeListing: {
      captionStyleId: 'bodyContent.codeListing.caption',
      sourceStyleId: 'bodyContent.codeListing.source',
      codeStyleId: 'bodyContent.codeListing.code',
      captionTemplate: bc.codeListing.captionTemplate,
      sourceTemplate: bc.codeListing.sourceTemplate,
      continuationLabels: { first: 'continua', middle: 'continuação', last: 'conclusão' },
      sourcePlacement: 'LAST_PART_ONLY',
      codeAlignment: 'LEFT',
      widthPercent: bc.codeListing.widthPercent,
      repeatHeaderOnPageBreak: bc.codeListing.repeatHeaderOnPageBreak,
      numberingStrategy: bc.codeListing.numberingStrategy,
      label: bc.codeListing.label,
    },
    chart: {
      captionStyleId: 'bodyContent.chart.caption',
      sourceStyleId: 'bodyContent.chart.source',
      captionTemplate: bc.chart.captionTemplate,
      sourceTemplate: bc.chart.sourceTemplate,
      continuationLabels: { first: 'continua', middle: 'continuação', last: 'conclusão' },
      sourcePlacement: 'LAST_PART_ONLY',
      imageAlignment: bc.chart.alignment,
      maxWidthCm: bc.chart.maxWidthCm ?? 16,
      maxHeightCm: bc.chart.maxHeightCm ?? 20,
      numberingStrategy: bc.chart.numberingStrategy,
      label: bc.chart.label,
    },
    equation: {
      captionStyleId: 'bodyContent.equation.caption',
      numberingTemplate: bc.equation.numberingTemplate,
      numberingAlignment: 'RIGHT',
      equationAlignment: bc.equation.alignment,
      numberingStrategy: bc.equation.numberingStrategy,
      label: bc.equation.label,
    },
  };
}

export function serializeState(state: BuilderState, existingId?: string): Record<string, unknown> {
  const generatedId = existingId
    ?? (state.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8));

  const componentOrder = state.components.filter(c => c.enabled).map(c => c.id);
  const componentRules: Record<string, unknown> = {};
  const extraStyleRules: StyleRule[] = [];

  for (const comp of state.components) {
    switch (comp.ruleType) {
      case 'SINGLE_PAGE': {
        componentRules[comp.id] = serializeSinglePage(comp, state.styleRules);
        // Auto-generate style rules for slots that have inline styleRule
        for (const slot of comp.slots ?? []) {
          if (slot.styleRule) {
            extraStyleRules.push(slot.styleRule);
          } else if (!state.styleRules.find(r => r.id === (slot.styleId ?? `${comp.id}.${slot.id}`))) {
            extraStyleRules.push(defaultStyleRule(slot.styleId ?? `${comp.id}.${slot.id}`));
          }
        }
        break;
      }
      case 'FLOW_TEXTUAL': {
        componentRules[comp.id] = {
          componentId: comp.id,
          items: (comp.flowItems ?? []).map(item => {
            const base: Record<string, unknown> = { type: item.type };
            if (item.styleId) base.styleId = item.styleId;
            if (item.type === 'HEADING') base.text = item.text ?? '';
            if (item.type === 'BLANK_LINES') base.count = item.count ?? 1;
            if (item.type === 'PLAIN_TEXT') base.slotName = item.slotName ?? '';
            if (item.type === 'TABLE_BLOCK') {
              base.headerStyleId = item.headerStyleId;
              base.cellStyleId = item.cellStyleId;
              base.headers = item.headers ?? [];
              base.rowsSlotName = item.rowsSlotName ?? '';
            }
            if (item.type === 'BOLD_LABELED_KEYWORDS') {
              base.labelSlotName = item.labelSlotName ?? '';
              base.keywordsSlotName = item.keywordsSlotName ?? '';
              base.separator = item.separator ?? '; ';
              base.terminator = item.terminator ?? '.';
            }
            if (item.type === 'PAIR_LIST') {
              base.termsSlotName = item.termsSlotName ?? '';
              base.definitionsSlotName = item.definitionsSlotName ?? '';
              base.separator = item.separator ?? ' — ';
            }
            if (item.type === 'REPEAT_GROUP') {
              base.entriesSlotName = item.entriesSlotName ?? '';
              base.pageBreakBetweenEntries = item.pageBreakBetweenEntries ?? false;
              base.group = item.group ?? [];
            }
            return base;
          }),
        };
        break;
      }
      case 'BIBLIOGRAPHY': {
        componentRules[comp.id] = {
          componentId: comp.id,
          headingStyleId: `${comp.id}.heading`,
          entryStyleId: `${comp.id}.entry`,
          headingText: comp.headingText ?? 'REFERÊNCIAS',
          blankLinesAfterHeading: comp.blankLinesAfterHeading ?? 2,
          blankLinesBetweenEntries: comp.blankLinesBetweenEntries ?? 1,
          sortOrder: comp.sortOrder ?? 'ALPHABETICAL',
          formattingRule: {
            authorFormat: {
              surnameUppercase: comp.authorFormat?.surnameUppercase ?? true,
              surnameGivenSeparator: comp.authorFormat?.surnameGivenSeparator ?? ', ',
              nameTerminator: comp.authorFormat?.nameTerminator ?? '.',
              multiAuthorJoiner: comp.authorFormat?.multiAuthorJoiner ?? '; ',
              etAlLabel: comp.authorFormat?.etAlLabel ?? 'et al.',
              etAlThreshold: comp.authorFormat?.etAlThreshold ?? 3,
            },
            entryFormats: comp.entryFormats ?? {},
          },
        };
        break;
      }
      case 'BODY_CONTENT': {
        componentRules[comp.id] = serializeBodyContent(comp);
        break;
      }
      case 'SECTIONED': {
        componentRules[comp.id] = {
          componentId: comp.id,
          headingTemplate: comp.headingTemplate ?? '{letter} — {title}',
          indexingStyle: comp.indexingStyle ?? 'ALPHABETIC',
          headingStyleId: `${comp.id}.heading`,
          bodyContentComponentId: comp.bodyContentComponentId ?? '',
          sectionTitleStyleIdsByLevel: comp.sectionTitleStyleIdsByLevel ?? ['bodyContent.heading1', 'bodyContent.heading2'],
        };
        break;
      }
      case 'ELEMENT_INDEX': {
        componentRules[comp.id] = {
          componentId: comp.id,
          elementType: comp.elementType ?? 'FIGURE',
          headingStyleId: `${comp.id}.heading`,
          entryStyleId: `${comp.id}.entry`,
          headingText: comp.headingText ?? 'LISTA',
          entryTemplate: comp.entryTemplate ?? '{number} — {caption}',
          blankLinesAfterHeading: comp.blankLinesAfterHeading ?? 1,
          pageReferenceEnabled: comp.pageReferenceEnabled ?? true,
        };
        break;
      }
      case 'SECTION_INDEX': {
        componentRules[comp.id] = {
          componentId: comp.id,
          headingStyleId: `${comp.id}.heading`,
          headingText: comp.headingText ?? 'SUMÁRIO',
          useTocField: comp.useTocField ?? true,
          blankLinesAfterHeading: comp.blankLinesAfterHeading ?? 1,
          entryStyleIdsByLevel: comp.entryStyleIdsByLevel ?? Array(6).fill(`${comp.id}.entry`),
        };
        break;
      }
    }
  }

  const allStyleRules = [
    ...state.styleRules,
    ...extraStyleRules.filter(r => !state.styleRules.find(s => s.id === r.id)),
  ];

  const pageLayout = state.page;
  const pn = pageLayout.pageNumbering;

  return {
    id: generatedId,
    displayName: state.name,
    componentOrder,
    pageLayout: {
      paperSize: {
        format: pageLayout.paperFormat === 'Custom' ? 'CUSTOM' : pageLayout.paperFormat.toUpperCase(),
        widthCm: pageLayout.widthCm,
        heightCm: pageLayout.heightCm,
      },
      orientation: pageLayout.orientation,
      margins: {
        topCm: pageLayout.marginTopCm,
        bottomCm: pageLayout.marginBottomCm,
        leftCm: pageLayout.marginLeftCm,
        rightCm: pageLayout.marginRightCm,
      },
    },
    fontRoles: {
      defaultFamily: pageLayout.fontRoles.defaultFamily,
      allowedFamilies: pageLayout.fontRoles.allowedFamilies,
    },
    ...(pn.enabled && pn.countFromComponentId && pn.visibleFromComponentId && {
      pageNumbering: {
        enabled: true,
        countFromComponentId: pn.countFromComponentId,
        visibleFromComponentId: pn.visibleFromComponentId,
        styleId: 'pageNumber',
        placement: pn.placement,
        verticalDistanceFromEdgeCm: pn.verticalDistanceFromEdgeCm,
        horizontalDistanceFromEdgeCm: pn.horizontalDistanceFromEdgeCm,
      },
    }),
    postProcessing: {
      tableContinuationLabels: {
        ...state.postProcessing.tableContinuationLabels,
        labelStyleId: 'bodyContent.paragraph',
      },
      orphanTitleCorrection: { enabled: state.postProcessing.orphanTitleEnabled },
      integrityCheck: state.postProcessing.integrityCheck,
      pdfOutput: { enabled: state.postProcessing.pdfOutputEnabled },
    },
    styleRules: allStyleRules,
    componentRules,
  };
}

// ──────────────────────────────────────────
// Deserializer: contrato JSON → BuilderState
// ──────────────────────────────────────────

function detectRuleType(compId: string, rule: Record<string, unknown>): ComponentRuleType {
  if (rule.slots) return 'SINGLE_PAGE';
  if (rule.items && Array.isArray(rule.items)) return 'FLOW_TEXTUAL';
  if (rule.formattingRule) return 'BIBLIOGRAPHY';
  if (rule.styleMapping && (rule.numbering || rule.layout)) return 'BODY_CONTENT';
  if (rule.sectionTitleStyleIdsByLevel && rule.headingTemplate !== undefined) return 'SECTIONED';
  if (rule.elementType || rule.entryTemplate !== undefined) return 'ELEMENT_INDEX';
  if (rule.useTocField !== undefined || rule.entryStyleIdsByLevel) return 'SECTION_INDEX';
  return 'FLOW_TEXTUAL';
}

export function deserializeContract(raw: Record<string, unknown>): BuilderState {
  const state = defaultBuilderState();

  // Meta
  state.name = (raw.displayName as string) ?? (raw.name as string) ?? '';
  state.description = '';
  state.isPublic = true;

  // Page layout
  const pl = raw.pageLayout as Record<string, unknown> | undefined;
  if (pl) {
    const ps = pl.paperSize as Record<string, unknown> | undefined;
    if (ps) {
      const fmt = (ps.format as string) ?? 'A4';
      const knownFormats: PageState['paperFormat'][] = ['A4', 'A3', 'A5', 'Letter', 'Legal', 'Tabloid'];
      const normalized = fmt.toUpperCase();
      if (normalized === 'CUSTOM') {
        state.page.paperFormat = 'Custom';
      } else {
        state.page.paperFormat = (knownFormats.find(f => f.toUpperCase() === normalized) ?? 'Custom') as PageState['paperFormat'];
      }
      if (typeof ps.widthCm === 'number') state.page.widthCm = ps.widthCm;
      if (typeof ps.heightCm === 'number') state.page.heightCm = ps.heightCm;
    }
    if (typeof pl.orientation === 'string') state.page.orientation = pl.orientation as 'PORTRAIT' | 'LANDSCAPE';
    const margins = pl.margins as Record<string, unknown> | undefined;
    if (margins) {
      if (typeof margins.topCm === 'number') state.page.marginTopCm = margins.topCm;
      if (typeof margins.bottomCm === 'number') state.page.marginBottomCm = margins.bottomCm;
      if (typeof margins.leftCm === 'number') state.page.marginLeftCm = margins.leftCm;
      if (typeof margins.rightCm === 'number') state.page.marginRightCm = margins.rightCm;
    }
  }

  // fontRoles
  const fr = raw.fontRoles as Record<string, unknown> | undefined;
  if (fr) {
    if (typeof fr.defaultFamily === 'string') state.page.fontRoles.defaultFamily = fr.defaultFamily;
    if (Array.isArray(fr.allowedFamilies)) state.page.fontRoles.allowedFamilies = fr.allowedFamilies as string[];
  }

  // Page numbering
  const pn = raw.pageNumbering as Record<string, unknown> | undefined;
  if (pn) {
    state.page.pageNumbering.enabled = (pn.enabled as boolean) ?? true;
    if (typeof pn.placement === 'string') state.page.pageNumbering.placement = pn.placement as PageState['pageNumbering']['placement'];
    if (typeof pn.countFromComponentId === 'string') state.page.pageNumbering.countFromComponentId = pn.countFromComponentId;
    if (typeof pn.visibleFromComponentId === 'string') state.page.pageNumbering.visibleFromComponentId = pn.visibleFromComponentId;
    if (typeof pn.verticalDistanceFromEdgeCm === 'number') state.page.pageNumbering.verticalDistanceFromEdgeCm = pn.verticalDistanceFromEdgeCm;
    if (typeof pn.horizontalDistanceFromEdgeCm === 'number') state.page.pageNumbering.horizontalDistanceFromEdgeCm = pn.horizontalDistanceFromEdgeCm;
  }

  // StyleRules
  if (Array.isArray(raw.styleRules)) {
    state.styleRules = raw.styleRules as StyleRule[];
  }

  // Post processing
  const pp = raw.postProcessing as Record<string, unknown> | undefined;
  if (pp) {
    const ot = pp.orphanTitleCorrection as Record<string, unknown> | undefined;
    if (ot) state.postProcessing.orphanTitleEnabled = (ot.enabled as boolean) ?? true;
    const tc = pp.tableContinuationLabels as Record<string, unknown> | undefined;
    if (tc) {
      state.postProcessing.tableContinuationLabels = {
        enabled: (tc.enabled as boolean) ?? true,
        continuesLabel: (tc.continuesLabel as string) ?? 'continua',
        continuationLabel: (tc.continuationLabel as string) ?? 'continuação',
        conclusionLabel: (tc.conclusionLabel as string) ?? 'conclusão',
      };
    }
    const ic = pp.integrityCheck as Record<string, unknown> | undefined;
    if (ic) {
      state.postProcessing.integrityCheck = {
        enabled: (ic.enabled as boolean) ?? true,
        checkMarginOverflow: (ic.checkMarginOverflow as boolean) ?? true,
        checkFontSubstitution: (ic.checkFontSubstitution as boolean) ?? true,
        maxPages: (ic.maxPages as number) ?? 500,
      };
    }
    const po = pp.pdfOutput as Record<string, unknown> | undefined;
    if (po) state.postProcessing.pdfOutputEnabled = (po.enabled as boolean) ?? false;
  }

  // Components
  const order = raw.componentOrder as string[] | undefined;
  const rules = raw.componentRules as Record<string, Record<string, unknown>> | undefined;

  // Legacy: top-level component rules (old format without componentRules wrapper)
  const allComponentIds = order ?? [];

  for (const compId of allComponentIds) {
    const rule: Record<string, unknown> = rules?.[compId] ?? (raw[compId] as Record<string, unknown>) ?? {};
    const ruleType = detectRuleType(compId, rule);

    const comp: ComponentState = {
      id: compId,
      displayName: compId,
      ruleType,
      enabled: true,
    };

    switch (ruleType) {
      case 'SINGLE_PAGE': {
        const rawSlots = rule.slots as Record<string, Record<string, unknown>> | undefined;
        const lr = rule.layoutRule as Record<string, unknown> | undefined;
        const sm = rule.styleMapping as Record<string, string> | undefined;

        comp.policy = (lr?.policy as ComponentState['policy']) ?? {
          anchorStrategy: 'LAST_GROUP_AT_SAFE_AREA_END',
          lineHeightStrategy: 'MAX_EXACT_LINE_HEIGHT',
          spacerStylePolicy: 'NEXT_GROUP_STYLE',
          safetyPolicy: 'MARGIN_BASED',
        };

        // Build ordered slots from layoutRule.groups
        const groups = lr?.groups as Array<Record<string, unknown>> | undefined;
        const gapRules = lr?.gapRules as Array<Record<string, unknown>> | undefined;

        const gapByFromGroup: Record<string, number> = {};
        for (const gr of gapRules ?? []) {
          gapByFromGroup[gr.fromGroupId as string] = (gr.weight as number) ?? 10;
        }

        const slots: SlotState[] = [];
        if (groups) {
          for (const group of groups) {
            const items = group.items as Array<Record<string, unknown>> | undefined;
            for (const item of items ?? []) {
              const slotId = item.id as string;
              const rawSlot = rawSlots?.[slotId];
              if (!rawSlot) continue;

              const hp = item.horizontalPlacement as Record<string, unknown> | undefined;
              let placement: SlotState['horizontalPlacement'] = 'FULL_CONTENT_WIDTH';
              let customLeft: number | undefined;
              let customRight: number | undefined;
              if (hp) {
                if (hp.strategy === 'CUSTOM_MARGINS') {
                  placement = 'CUSTOM';
                  customLeft = hp.leftMarginCm as number;
                  customRight = hp.rightMarginCm as number;
                } else {
                  placement = (hp.strategy as SlotState['horizontalPlacement']) ?? 'FULL_CONTENT_WIDTH';
                }
              }

              slots.push({
                id: slotId,
                type: (rawSlot.type as SlotType) ?? 'TEXT',
                required: (rawSlot.required as boolean) ?? false,
                template: rawSlot.template as string | undefined,
                fieldNames: rawSlot.fieldNames as string[] | undefined,
                signatureLineEnabled: rawSlot.signatureLineEnabled as boolean | undefined,
                signatureLineText: rawSlot.signatureLineText as string | undefined,
                lineTemplates: rawSlot.lineTemplates as string[] | undefined,
                styleId: sm?.[slotId],
                horizontalPlacement: placement,
                customLeftMarginCm: customLeft,
                customRightMarginCm: customRight,
                blankLinesAfter: (item.blankLinesAfter as number) ?? 0,
                maxVisualLinesPerValue: item.maxVisualLinesPerValue as number | undefined,
                gapWeight: gapByFromGroup[group.id as string] ?? 10,
              });
            }
          }
        } else if (rawSlots) {
          // Fallback sem layoutRule
          for (const [slotId, rawSlot] of Object.entries(rawSlots)) {
            slots.push({
              id: slotId,
              type: (rawSlot.type as SlotType) ?? 'TEXT',
              required: (rawSlot.required as boolean) ?? false,
              styleId: sm?.[slotId],
              horizontalPlacement: 'FULL_CONTENT_WIDTH',
              gapWeight: 10,
            });
          }
        }

        comp.slots = slots;
        break;
      }
      case 'FLOW_TEXTUAL': {
        comp.flowItems = (rule.items as FlowItem[]) ?? [];
        break;
      }
      case 'BIBLIOGRAPHY': {
        comp.headingText = rule.headingText as string ?? 'REFERÊNCIAS';
        comp.blankLinesAfterHeading = rule.blankLinesAfterHeading as number ?? 2;
        comp.blankLinesBetweenEntries = rule.blankLinesBetweenEntries as number ?? 1;
        comp.sortOrder = (rule.sortOrder as 'ALPHABETICAL' | 'NONE') ?? 'ALPHABETICAL';
        const fr2 = rule.formattingRule as Record<string, unknown> | undefined;
        if (fr2) {
          const af = fr2.authorFormat as Record<string, unknown> | undefined;
          if (af) {
            comp.authorFormat = {
              surnameUppercase: (af.surnameUppercase as boolean) ?? true,
              surnameGivenSeparator: (af.surnameGivenSeparator as string) ?? ', ',
              nameTerminator: (af.nameTerminator as string) ?? '.',
              multiAuthorJoiner: (af.multiAuthorJoiner as string) ?? '; ',
              etAlLabel: (af.etAlLabel as string) ?? 'et al.',
              etAlThreshold: (af.etAlThreshold as number) ?? 3,
            };
          }
          comp.entryFormats = (fr2.entryFormats as ComponentState['entryFormats']) ?? {};
        }
        break;
      }
      case 'BODY_CONTENT': {
        const bc = defaultBodyContentState();
        const sm2 = rule.styleMapping as Record<string, unknown> | undefined;
        if (sm2) {
          if (Array.isArray(sm2.sectionTitleStyleIdsByLevel)) bc.sectionTitleStyleIdsByLevel = sm2.sectionTitleStyleIdsByLevel as string[];
          if (typeof sm2.paragraphStyleId === 'string') bc.paragraphStyleId = sm2.paragraphStyleId;
        }
        const nb = rule.numbering as Record<string, unknown> | undefined;
        if (nb) bc.numbering = { ...bc.numbering, ...nb as Partial<BodyContentState['numbering']> };
        const layout2 = rule.layout as Record<string, unknown> | undefined;
        if (layout2) bc.layout = { ...bc.layout, ...(layout2 as Partial<BodyContentState['layout']>) };
        const cf = rule.citationFormatting as Record<string, unknown> | undefined;
        if (cf) bc.citationFormatting = { ...bc.citationFormatting, ...cf as Partial<BodyContentState['citationFormatting']> };
        const crl = rule.crossReferenceLabels as Record<string, unknown> | undefined;
        if (crl) bc.crossReferenceLabels = { ...bc.crossReferenceLabels, ...crl as Partial<BodyContentState['crossReferenceLabels']> };
        comp.bodyContent = bc;
        break;
      }
      case 'SECTIONED': {
        comp.headingTemplate = rule.headingTemplate as string ?? '{letter} — {title}';
        comp.indexingStyle = (rule.indexingStyle as 'ALPHABETIC' | 'NUMERIC') ?? 'ALPHABETIC';
        comp.bodyContentComponentId = rule.bodyContentComponentId as string ?? '';
        comp.sectionTitleStyleIdsByLevel = rule.sectionTitleStyleIdsByLevel as string[] ?? [];
        break;
      }
      case 'ELEMENT_INDEX': {
        comp.elementType = (rule.elementType as ComponentState['elementType']) ?? 'FIGURE';
        comp.headingText = rule.headingText as string ?? 'LISTA';
        comp.entryTemplate = rule.entryTemplate as string ?? '{number} — {caption}';
        comp.blankLinesAfterHeading = rule.blankLinesAfterHeading as number ?? 1;
        comp.pageReferenceEnabled = (rule.pageReferenceEnabled as boolean) ?? true;
        break;
      }
      case 'SECTION_INDEX': {
        comp.headingText = rule.headingText as string ?? 'SUMÁRIO';
        comp.useTocField = (rule.useTocField as boolean) ?? true;
        comp.blankLinesAfterHeading = rule.blankLinesAfterHeading as number ?? 1;
        comp.entryStyleIdsByLevel = rule.entryStyleIdsByLevel as string[] ?? [];
        break;
      }
    }

    state.components.push(comp);
  }

  return state;
}
