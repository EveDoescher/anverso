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
  displayName?: string;
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
  description?: string;
  placeholder?: string;
  type: SlotType;
  required: boolean;
  // COMPOSED_TEXT
  template?: string;
  fieldNames?: string[];
  // SIGNATURE_BLOCK_LIST
  signatureLineEnabled?: boolean;
  signatureLineText?: string;
  lineTemplates?: string[];
  knownFieldNames?: string[];
  // StyleRule inline
  styleId?: string;
  styleRule?: StyleRule;
  // Placement (SINGLE_PAGE)
  horizontalPlacement?: 'FULL_CONTENT_WIDTH' | 'FROM_PAGE_CENTER_TO_RIGHT_MARGIN' | 'CUSTOM';
  customLeftMarginCm?: number;
  customRightMarginCm?: number;
  blankLinesAfter?: number;
  maxVisualLinesPerValue?: number;
  // gapWeight: peso do gap ANTES deste grupo (só relevante no primeiro slot do grupo)
  gapWeight?: number;
  // groupId: slots com mesmo groupId ficam no mesmo grupo de layout
  groupId?: string;
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
  italic: boolean;
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
    keepWithNextOnHeadings: boolean;
    inlineHeadingLevels?: number[];
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

// --- Font role ---
export interface FontRole {
  key: string;
  defaultFamily: string;
  allowedFamilies: string[];
  styleIds: string[];
}

// --- Component state ---
export interface ComponentState {
  id: string;
  displayName: string;
  description?: string;
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
    lastAuthorJoiner?: string;
    nameOrder?: 'SURNAME_FIRST' | 'GIVEN_FIRST';
    initialsOnly?: boolean;
    initialsDotted?: boolean;
    initialsSpaced?: boolean;
  };
  entryFormats?: Partial<Record<BibRefType, BibEntryPart[]>>;
  noteFormats?: Partial<Record<BibRefType, BibEntryPart[]>>;
  shortNoteFormats?: Partial<Record<BibRefType, BibEntryPart[]>>;
  ibidEnabled?: boolean;
  headingStyleId?: string;
  entryStyleId?: string;

  // BODY_CONTENT (configurado na seção Corpo do Texto)
  bodyContent?: BodyContentState;

  // SECTIONED
  headingTemplate?: string;
  indexingStyle?: 'ALPHABETIC' | 'NUMERIC';
  bodyContentComponentId?: string;
  sectionTitleStyleIdsByLevel?: string[];
  paragraphStyleId?: string;

  // ELEMENT_INDEX
  elementType?: 'FIGURE' | 'TABLE' | 'FRAME' | 'CHART' | 'CODE_LISTING';
  entryTemplate?: string;
  pageReferenceEnabled?: boolean;
  sourceComponentId?: string;

  // SECTION_INDEX
  useTocField?: boolean;
  entryStyleIdsByLevel?: string[];
}

// --- Page state ---
export interface PageState {
  paperFormat: 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | 'Tabloid' | 'Custom'; // UI only, not serialized
  widthCm: number;
  heightCm: number;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  marginTopCm: number;
  marginBottomCm: number;
  marginLeftCm: number;
  marginRightCm: number;
  fontRoles: {
    roles: FontRole[];
  };
  pageNumbering: {
    enabled: boolean;
    placement: 'HEADER_RIGHT' | 'HEADER_CENTER' | 'FOOTER_RIGHT' | 'FOOTER_CENTER';
    countFromComponentId: string;
    visibleFromComponentId: string;
    verticalDistanceFromPageEdgeCm: number;
    horizontalDistanceFromPageEdgeCm: number;
  };
}

export interface PostProcessingState {
  orphanTitleEnabled: boolean;
  tableContinuationLabels: {
    enabled: boolean;
    continuesLabel: string;
    continuationLabel: string;
    conclusionLabel: string;
    labelStyleId: string;
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

export function styleIdToDisplayName(id: string): string {
  return id
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

export function displayNameToStyleId(name: string): string {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/, '');
}

export function defaultStyleRule(id: string, overrides: Partial<StyleRule> = {}): StyleRule {
  return {
    id,
    displayName: styleIdToDisplayName(id),
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
        roles: [{
          key: 'baseFont',
          defaultFamily: 'Times New Roman',
          allowedFamilies: ['Times New Roman', 'Arial', 'Calibri'],
          styleIds: [],
        }],
      },
      pageNumbering: {
        enabled: true,
        placement: 'HEADER_RIGHT',
        countFromComponentId: '',
        visibleFromComponentId: '',
        verticalDistanceFromPageEdgeCm: 2,
        horizontalDistanceFromPageEdgeCm: 2,
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
        labelStyleId: 'bodyContent.table.header',
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
      keepWithNextOnHeadings: false,
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
      captionTemplate: 'Figura {number} – {caption}',
      sourceTemplate: 'Fonte: {source}',
      alignment: 'CENTER',
      fontSizePt: 10,
      numberingStrategy: 'GLOBAL_SEQUENTIAL',
      label: 'Figura',
      maxWidthCm: 16,
      maxHeightCm: 20,
    },
    table: {
      captionTemplate: 'Tabela {number} – {caption}',
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
      captionTemplate: 'Quadro {number} – {caption}',
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
      captionTemplate: 'Gráfico {number} – {caption}',
      sourceTemplate: 'Fonte: {source}',
      alignment: 'CENTER',
      fontSizePt: 10,
      numberingStrategy: 'GLOBAL_SEQUENTIAL',
      label: 'Gráfico',
      maxWidthCm: 16,
      maxHeightCm: 20,
    },
    codeListing: {
      captionTemplate: 'Listagem {number} – {caption}',
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
      openQuote: '"',
      closeQuote: '"',
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
// Helpers
// ──────────────────────────────────────────

function inferPaperFormat(widthCm: number, heightCm: number): PageState['paperFormat'] {
  const presets: Array<[PageState['paperFormat'], number, number]> = [
    ['A4', 21, 29.7],
    ['A3', 29.7, 42],
    ['A5', 14.8, 21],
    ['Letter', 21.59, 27.94],
    ['Legal', 21.59, 35.56],
    ['Tabloid', 27.94, 43.18],
  ];
  for (const [fmt, w, h] of presets) {
    if (Math.abs(widthCm - w) < 0.1 && Math.abs(heightCm - h) < 0.1) return fmt;
  }
  return 'Custom';
}

// ──────────────────────────────────────────
// Serializer: BuilderState → contrato JSON
// ──────────────────────────────────────────

function serializeSinglePage(comp: ComponentState, _styleRules: StyleRule[]): Record<string, unknown> {
  const slots: Record<string, unknown> = {};
  const styleMapping: Record<string, string> = {};
  const groups: unknown[] = [];
  const gapRules: unknown[] = [];

  const compSlots = comp.slots ?? [];

  // Group slots by groupId; slots without groupId each get their own group
  type GroupBucket = { id: string; slots: SlotState[] };
  const groupBuckets: GroupBucket[] = [];
  for (const slot of compSlots) {
    if (slot.groupId) {
      const existing = groupBuckets.find(g => g.id === slot.groupId);
      if (existing) {
        existing.slots.push(slot);
        continue;
      }
      groupBuckets.push({ id: slot.groupId, slots: [slot] });
    } else {
      groupBuckets.push({ id: `${comp.id}.${slot.id}Block`, slots: [slot] });
    }
  }

  // Build slots map and styleMapping
  compSlots.forEach(slot => {
    const sId = slot.styleId ?? `${comp.id}.${slot.id}`;
    styleMapping[slot.id] = sId;

    slots[slot.id] = {
      type: slot.type,
      required: slot.required,
      ...(slot.displayName && { displayName: slot.displayName }),
      ...(slot.description && { description: slot.description }),
      ...(slot.placeholder && { placeholder: slot.placeholder }),
      ...(slot.type === 'COMPOSED_TEXT' && {
        template: slot.template ?? '',
        fieldNames: slot.fieldNames ?? [],
      }),
      ...(slot.type === 'SIGNATURE_BLOCK_LIST' && {
        signatureLineEnabled: slot.signatureLineEnabled ?? true,
        signatureLineText: slot.signatureLineText ?? '________________________________________',
        lineTemplates: slot.lineTemplates ?? ['{title} {name}', '{institutionName}', '{role}'],
        knownFieldNames: slot.knownFieldNames ?? [],
      }),
    };
  });

  // Build groups and gapRules
  for (let gi = 0; gi < groupBuckets.length; gi++) {
    const bucket = groupBuckets[gi];
    const firstSlot = bucket.slots[0];

    groups.push({
      id: bucket.id,
      required: bucket.slots.some(s => s.required),
      items: bucket.slots.map(slot => ({
        id: slot.id,
        required: slot.required,
        horizontalPlacement: slot.horizontalPlacement === 'CUSTOM'
          ? { strategy: 'CUSTOM_MARGINS', leftMarginCm: slot.customLeftMarginCm ?? 0, rightMarginCm: slot.customRightMarginCm ?? 0 }
          : { strategy: slot.horizontalPlacement ?? 'FULL_CONTENT_WIDTH' },
        blankLinesAfter: slot.blankLinesAfter ?? 0,
        ...(slot.maxVisualLinesPerValue !== undefined && { maxVisualLinesPerValue: slot.maxVisualLinesPerValue }),
      })),
    });

    if (gi > 0) {
      const prevBucket = groupBuckets[gi - 1];
      gapRules.push({
        fromGroupId: prevBucket.id,
        toGroupId: bucket.id,
        weight: firstSlot.gapWeight ?? 10,
      });
    }
  }

  return {
    ruleType: 'SINGLE_PAGE',
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
  const layout = {
    ...bc.layout,
    blankLineStyleId: bc.paragraphStyleId,
  } as Record<string, unknown>;
  // Remove internal UI field that shouldn't go to contract
  delete layout.keepWithNextOnHeadings;
  delete layout.inlineHeadingLevels;
  // Add contract fields
  layout.keepWithNextOnHeadings = bc.layout.keepWithNextOnHeadings;
  if (bc.layout.inlineHeadingLevels && bc.layout.inlineHeadingLevels.length > 0) {
    layout.inlineHeadingLevels = bc.layout.inlineHeadingLevels;
  }

  const imageRuleBase = {
    captionStyleId: 'bodyContent.figure.caption',
    sourceStyleId: 'bodyContent.figure.source',
    captionTemplate: bc.chart.captionTemplate,
    sourceTemplate: bc.chart.sourceTemplate,
    continuationLabels: { first: 'continua', middle: 'continuação', last: 'conclusão' },
    sourcePlacement: 'LAST_PART_ONLY',
    imageAlignment: bc.chart.alignment,
    maxWidthCm: bc.chart.maxWidthCm ?? 16,
    maxHeightCm: bc.chart.maxHeightCm ?? 18,
    defaultDpi: 96,
    maxImageBytes: 2000000,
    urlFetchTimeoutSeconds: 10,
    fitPolicy: 'SCALE_DOWN_PRESERVE_ASPECT_RATIO',
    numberingStrategy: bc.chart.numberingStrategy,
    label: bc.chart.label,
  };

  return {
    ruleType: 'BODY_CONTENT',
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
    layout,
    citationFormatting: bc.citationFormatting,
    crossReferenceLabels: bc.crossReferenceLabels,
    figure: {
      captionStyleId: 'bodyContent.figure.caption',
      sourceStyleId: 'bodyContent.figure.source',
      captionTemplate: bc.figure.captionTemplate,
      sourceTemplate: bc.figure.sourceTemplate,
      continuationLabels: { first: 'continua', middle: 'continuação', last: 'conclusão' },
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
      numberingStrategy: bc.chart.numberingStrategy,
      label: bc.chart.label,
      imageRule: imageRuleBase,
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
    const compDescription = comp.description ? { description: comp.description } : {};
    switch (comp.ruleType) {
      case 'SINGLE_PAGE': {
        componentRules[comp.id] = { ...serializeSinglePage(comp, state.styleRules), ...compDescription };
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
          ...compDescription,
          ruleType: 'FLOW_TEXTUAL',
          componentId: comp.id,
          items: (comp.flowItems ?? []).map(item => {
            const base: Record<string, unknown> = { itemType: item.type };
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
        const af = comp.authorFormat;
        const authorFormat: Record<string, unknown> = {
          surnameUppercase: af?.surnameUppercase ?? true,
          surnameGivenSeparator: af?.surnameGivenSeparator ?? ', ',
          nameTerminator: af?.nameTerminator ?? '.',
          multiAuthorJoiner: af?.multiAuthorJoiner ?? '; ',
          etAlLabel: af?.etAlLabel ?? 'et al.',
          etAlThreshold: af?.etAlThreshold ?? 3,
        };
        if (af?.lastAuthorJoiner !== undefined) authorFormat.lastAuthorJoiner = af.lastAuthorJoiner;
        if (af?.nameOrder !== undefined) authorFormat.nameOrder = af.nameOrder;
        if (af?.initialsOnly !== undefined) authorFormat.initialsOnly = af.initialsOnly;
        if (af?.initialsDotted !== undefined) authorFormat.initialsDotted = af.initialsDotted;
        if (af?.initialsSpaced !== undefined) authorFormat.initialsSpaced = af.initialsSpaced;

        const formattingRule: Record<string, unknown> = { authorFormat, entryFormats: comp.entryFormats ?? {} };
        if (comp.noteFormats) formattingRule.noteFormats = comp.noteFormats;
        if (comp.shortNoteFormats) formattingRule.shortNoteFormats = comp.shortNoteFormats;
        if (comp.ibidEnabled !== undefined) formattingRule.ibidEnabled = comp.ibidEnabled;

        componentRules[comp.id] = {
          ...compDescription,
          ruleType: 'BIBLIOGRAPHY',
          componentId: comp.id,
          headingStyleId: comp.headingStyleId ?? `${comp.id}.heading`,
          entryStyleId: comp.entryStyleId ?? `${comp.id}.entry`,
          headingText: comp.headingText ?? 'REFERÊNCIAS',
          blankLinesAfterHeading: comp.blankLinesAfterHeading ?? 2,
          blankLinesBetweenEntries: comp.blankLinesBetweenEntries ?? 1,
          sortOrder: comp.sortOrder ?? 'ALPHABETICAL',
          formattingRule,
        };
        break;
      }
      case 'BODY_CONTENT': {
        componentRules[comp.id] = { ...serializeBodyContent(comp), ...compDescription };
        break;
      }
      case 'SECTIONED': {
        componentRules[comp.id] = {
          ...compDescription,
          ruleType: 'SECTIONED',
          componentId: comp.id,
          headingTemplate: comp.headingTemplate ?? '{letter} — {title}',
          indexingStyle: comp.indexingStyle ?? 'ALPHABETIC',
          headingStyleId: comp.headingStyleId ?? `${comp.id}.heading`,
          bodyContentComponentId: comp.bodyContentComponentId ?? '',
          sectionTitleStyleIdsByLevel: comp.sectionTitleStyleIdsByLevel ?? ['bodyContent.heading1', 'bodyContent.heading2'],
          paragraphStyleId: comp.paragraphStyleId ?? '',
        };
        break;
      }
      case 'ELEMENT_INDEX': {
        componentRules[comp.id] = {
          ...compDescription,
          ruleType: 'ELEMENT_INDEX',
          componentId: comp.id,
          elementType: comp.elementType ?? 'FIGURE',
          headingStyleId: comp.headingStyleId ?? `${comp.id}.heading`,
          entryStyleId: comp.entryStyleId ?? `${comp.id}.entry`,
          headingText: comp.headingText ?? 'LISTA',
          entryTemplate: comp.entryTemplate ?? '{number} — {caption}',
          blankLinesAfterHeading: comp.blankLinesAfterHeading ?? 1,
          pageReferenceEnabled: comp.pageReferenceEnabled ?? true,
          sourceComponentId: comp.sourceComponentId ?? '',
        };
        break;
      }
      case 'SECTION_INDEX': {
        componentRules[comp.id] = {
          ...compDescription,
          ruleType: 'SECTION_INDEX',
          componentId: comp.id,
          headingStyleId: comp.headingStyleId ?? `${comp.id}.heading`,
          headingText: comp.headingText ?? 'SUMÁRIO',
          useTocField: comp.useTocField ?? true,
          blankLinesAfterHeading: comp.blankLinesAfterHeading ?? 1,
          entryStyleIdsByLevel: comp.entryStyleIdsByLevel ?? Array(6).fill(`${comp.id}.entry`),
          sourceComponentId: comp.sourceComponentId ?? '',
        };
        break;
      }
    }
  }

  const allStyleRules = [
    ...state.styleRules,
    ...extraStyleRules.filter(r => !state.styleRules.find(s => s.id === r.id)),
  ];

  const page = state.page;
  const pn = page.pageNumbering;

  // Serialize fontRoles as map of roles (contract format)
  const fontRolesOut: Record<string, unknown> = {};
  for (const role of page.fontRoles.roles) {
    fontRolesOut[role.key] = {
      default: role.defaultFamily,
      allowedValues: role.allowedFamilies,
      styleIds: role.styleIds,
    };
  }

  return {
    id: generatedId,
    displayName: state.name,
    componentOrder,
    pageRule: {
      widthCm: page.widthCm,
      heightCm: page.heightCm,
      marginTopCm: page.marginTopCm,
      marginRightCm: page.marginRightCm,
      marginBottomCm: page.marginBottomCm,
      marginLeftCm: page.marginLeftCm,
      orientation: page.orientation,
    },
    fontRoles: fontRolesOut,
    ...(pn.enabled && pn.countFromComponentId && pn.visibleFromComponentId && {
      pageNumbering: {
        enabled: true,
        countFromComponentId: pn.countFromComponentId,
        visibleFromComponentId: pn.visibleFromComponentId,
        styleId: 'pageNumber',
        placement: pn.placement,
        verticalDistanceFromPageEdgeCm: pn.verticalDistanceFromPageEdgeCm,
        horizontalDistanceFromPageEdgeCm: pn.horizontalDistanceFromPageEdgeCm,
      },
    }),
    postProcessing: {
      tableContinuationLabels: {
        enabled: state.postProcessing.tableContinuationLabels.enabled,
        continuesLabel: state.postProcessing.tableContinuationLabels.continuesLabel,
        continuationLabel: state.postProcessing.tableContinuationLabels.continuationLabel,
        conclusionLabel: state.postProcessing.tableContinuationLabels.conclusionLabel,
        labelStyleId: state.postProcessing.tableContinuationLabels.labelStyleId,
      },
      orphanTitleCorrection: { enabled: state.postProcessing.orphanTitleEnabled },
      integrityCheck: { enabled: true, checkMarginOverflow: true, checkFontSubstitution: true, maxPages: 500 },
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
  // Prefer explicit ruleType discriminator
  if (typeof rule.ruleType === 'string') return rule.ruleType as ComponentRuleType;
  // Fallback heuristics
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

  // Page: try pageRule (contract format) first, fallback to legacy pageLayout
  const pr = raw.pageRule as Record<string, unknown> | undefined;
  const pl = raw.pageLayout as Record<string, unknown> | undefined;

  if (pr) {
    if (typeof pr.widthCm === 'number') state.page.widthCm = pr.widthCm;
    if (typeof pr.heightCm === 'number') state.page.heightCm = pr.heightCm;
    if (typeof pr.orientation === 'string') state.page.orientation = pr.orientation as 'PORTRAIT' | 'LANDSCAPE';
    if (typeof pr.marginTopCm === 'number') state.page.marginTopCm = pr.marginTopCm;
    if (typeof pr.marginBottomCm === 'number') state.page.marginBottomCm = pr.marginBottomCm;
    if (typeof pr.marginLeftCm === 'number') state.page.marginLeftCm = pr.marginLeftCm;
    if (typeof pr.marginRightCm === 'number') state.page.marginRightCm = pr.marginRightCm;
    state.page.paperFormat = inferPaperFormat(state.page.widthCm, state.page.heightCm);
  } else if (pl) {
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

  // fontRoles: try contract format (map of roles), fallback to legacy {defaultFamily, allowedFamilies}
  const fr = raw.fontRoles as Record<string, unknown> | undefined;
  if (fr) {
    const roles: FontRole[] = [];
    for (const [key, roleVal] of Object.entries(fr)) {
      if (key === 'defaultFamily' || key === 'allowedFamilies') continue; // legacy keys
      if (typeof roleVal !== 'object' || roleVal === null) continue;
      const rv = roleVal as Record<string, unknown>;
      roles.push({
        key,
        defaultFamily: (rv.default as string) ?? 'Times New Roman',
        allowedFamilies: Array.isArray(rv.allowedValues) ? (rv.allowedValues as string[]) : [],
        styleIds: Array.isArray(rv.styleIds) ? (rv.styleIds as string[]) : [],
      });
    }
    if (roles.length > 0) {
      state.page.fontRoles.roles = roles;
    } else {
      // Legacy format: {defaultFamily, allowedFamilies}
      const legacyDefault = fr.defaultFamily as string | undefined;
      const legacyAllowed = fr.allowedFamilies as string[] | undefined;
      if (legacyDefault) {
        state.page.fontRoles.roles = [{
          key: 'baseFont',
          defaultFamily: legacyDefault,
          allowedFamilies: legacyAllowed ?? [],
          styleIds: [],
        }];
      }
    }
  }

  // Page numbering
  const pn = raw.pageNumbering as Record<string, unknown> | undefined;
  if (pn) {
    state.page.pageNumbering.enabled = (pn.enabled as boolean) ?? true;
    if (typeof pn.placement === 'string') state.page.pageNumbering.placement = pn.placement as PageState['pageNumbering']['placement'];
    if (typeof pn.countFromComponentId === 'string') state.page.pageNumbering.countFromComponentId = pn.countFromComponentId;
    if (typeof pn.visibleFromComponentId === 'string') state.page.pageNumbering.visibleFromComponentId = pn.visibleFromComponentId;
    // Support both field name variants
    const vd = pn.verticalDistanceFromPageEdgeCm ?? pn.verticalDistanceFromEdgeCm;
    if (typeof vd === 'number') state.page.pageNumbering.verticalDistanceFromPageEdgeCm = vd;
    const hd = pn.horizontalDistanceFromPageEdgeCm ?? pn.horizontalDistanceFromEdgeCm;
    if (typeof hd === 'number') state.page.pageNumbering.horizontalDistanceFromPageEdgeCm = hd;
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
        labelStyleId: (tc.labelStyleId as string) ?? 'bodyContent.table.header',
      };
    }
    const po = pp.pdfOutput as Record<string, unknown> | undefined;
    if (po) state.postProcessing.pdfOutputEnabled = (po.enabled as boolean) ?? false;
  }

  // Components
  const order = raw.componentOrder as string[] | undefined;
  const rules = raw.componentRules as Record<string, Record<string, unknown>> | undefined;
  const allComponentIds = order ?? [];

  for (const compId of allComponentIds) {
    const rule: Record<string, unknown> = rules?.[compId] ?? (raw[compId] as Record<string, unknown>) ?? {};
    const ruleType = detectRuleType(compId, rule);

    const comp: ComponentState = {
      id: compId,
      displayName: (rule.displayName as string) || compId,
      description: rule.description as string | undefined,
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

        const groups = lr?.groups as Array<Record<string, unknown>> | undefined;
        const gapRules = lr?.gapRules as Array<Record<string, unknown>> | undefined;

        // gapByFromGroup[groupId] = gap weight leading FROM that group to next
        const gapByFromGroup: Record<string, number> = {};
        for (const gr of gapRules ?? []) {
          gapByFromGroup[gr.fromGroupId as string] = (gr.weight as number) ?? 10;
        }

        const slots: SlotState[] = [];
        if (groups) {
          for (const group of groups) {
            const groupId = group.id as string;
            const items = group.items as Array<Record<string, unknown>> | undefined;
            const hasMultipleItems = (items?.length ?? 0) > 1;

            for (let itemIdx = 0; itemIdx < (items?.length ?? 0); itemIdx++) {
              const item = items![itemIdx];
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
                displayName: rawSlot.displayName as string | undefined,
                description: rawSlot.description as string | undefined,
                placeholder: rawSlot.placeholder as string | undefined,
                type: (rawSlot.type as SlotType) ?? 'TEXT',
                required: (rawSlot.required as boolean) ?? false,
                template: rawSlot.template as string | undefined,
                fieldNames: rawSlot.fieldNames as string[] | undefined,
                signatureLineEnabled: rawSlot.signatureLineEnabled as boolean | undefined,
                signatureLineText: rawSlot.signatureLineText as string | undefined,
                lineTemplates: rawSlot.lineTemplates as string[] | undefined,
                knownFieldNames: rawSlot.knownFieldNames as string[] | undefined,
                styleId: sm?.[slotId],
                horizontalPlacement: placement,
                customLeftMarginCm: customLeft,
                customRightMarginCm: customRight,
                blankLinesAfter: (item.blankLinesAfter as number) ?? 0,
                maxVisualLinesPerValue: item.maxVisualLinesPerValue as number | undefined,
                // First slot of a multi-slot group gets gapWeight; single-slot groups always get it
                gapWeight: itemIdx === 0 ? (gapByFromGroup[groupId] ?? 10) : undefined,
                groupId: hasMultipleItems ? groupId : undefined,
              });
            }
          }
        } else if (rawSlots) {
          for (const [slotId, rawSlot] of Object.entries(rawSlots)) {
            slots.push({
              id: slotId,
              displayName: rawSlot.displayName as string | undefined,
              description: rawSlot.description as string | undefined,
              placeholder: rawSlot.placeholder as string | undefined,
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
        // Map itemType → type for items from contract JSON
        comp.flowItems = ((rule.items as Array<Record<string, unknown>>) ?? []).map(item => ({
          ...item,
          type: ((item.itemType ?? item.type) as FlowItemType),
        })) as FlowItem[];
        break;
      }
      case 'BIBLIOGRAPHY': {
        comp.headingText = rule.headingText as string ?? 'REFERÊNCIAS';
        comp.blankLinesAfterHeading = rule.blankLinesAfterHeading as number ?? 2;
        comp.blankLinesBetweenEntries = rule.blankLinesBetweenEntries as number ?? 1;
        comp.sortOrder = (rule.sortOrder as 'ALPHABETICAL' | 'NONE') ?? 'ALPHABETICAL';
        if (typeof rule.headingStyleId === 'string') comp.headingStyleId = rule.headingStyleId;
        if (typeof rule.entryStyleId === 'string') comp.entryStyleId = rule.entryStyleId;
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
              lastAuthorJoiner: af.lastAuthorJoiner as string | undefined,
              nameOrder: af.nameOrder as 'SURNAME_FIRST' | 'GIVEN_FIRST' | undefined,
              initialsOnly: af.initialsOnly as boolean | undefined,
              initialsDotted: af.initialsDotted as boolean | undefined,
              initialsSpaced: af.initialsSpaced as boolean | undefined,
            };
          }
          comp.entryFormats = (fr2.entryFormats as ComponentState['entryFormats']) ?? {};
          if (fr2.noteFormats) comp.noteFormats = fr2.noteFormats as ComponentState['noteFormats'];
          if (fr2.shortNoteFormats) comp.shortNoteFormats = fr2.shortNoteFormats as ComponentState['shortNoteFormats'];
          if (typeof fr2.ibidEnabled === 'boolean') comp.ibidEnabled = fr2.ibidEnabled;
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
        if (layout2) {
          bc.layout = {
            ...bc.layout,
            blankLinesBeforeSectionTitleWhenPrecededByContent: (layout2.blankLinesBeforeSectionTitleWhenPrecededByContent as number) ?? bc.layout.blankLinesBeforeSectionTitleWhenPrecededByContent,
            blankLinesAfterSectionTitle: (layout2.blankLinesAfterSectionTitle as number) ?? bc.layout.blankLinesAfterSectionTitle,
            pageBreakBeforePrimarySection: (layout2.pageBreakBeforePrimarySection as boolean) ?? bc.layout.pageBreakBeforePrimarySection,
            keepWithNextOnHeadings: (layout2.keepWithNextOnHeadings as boolean) ?? bc.layout.keepWithNextOnHeadings,
            inlineHeadingLevels: Array.isArray(layout2.inlineHeadingLevels) ? (layout2.inlineHeadingLevels as number[]) : undefined,
          };
        }
        const cf = rule.citationFormatting as Record<string, unknown> | undefined;
        if (cf) bc.citationFormatting = { ...bc.citationFormatting, ...cf as Partial<BodyContentState['citationFormatting']> };
        const crl = rule.crossReferenceLabels as Record<string, unknown> | undefined;
        if (crl) bc.crossReferenceLabels = { ...bc.crossReferenceLabels, ...crl as Partial<BodyContentState['crossReferenceLabels']> };

        // Deserialize figure
        const fig = rule.figure as Record<string, unknown> | undefined;
        if (fig) {
          bc.figure = {
            captionTemplate: (fig.captionTemplate as string) ?? bc.figure.captionTemplate,
            sourceTemplate: (fig.sourceTemplate as string) ?? bc.figure.sourceTemplate,
            alignment: (fig.imageAlignment as 'CENTER' | 'LEFT' | 'RIGHT') ?? bc.figure.alignment,
            fontSizePt: bc.figure.fontSizePt,
            numberingStrategy: (fig.numberingStrategy as 'GLOBAL_SEQUENTIAL' | 'BY_CHAPTER') ?? bc.figure.numberingStrategy,
            label: (fig.label as string) ?? bc.figure.label,
            maxWidthCm: (fig.maxWidthCm as number) ?? bc.figure.maxWidthCm,
            maxHeightCm: (fig.maxHeightCm as number) ?? bc.figure.maxHeightCm,
          };
        }

        // Deserialize table
        const tbl = rule.table as Record<string, unknown> | undefined;
        if (tbl) {
          bc.table = {
            captionTemplate: (tbl.captionTemplate as string) ?? bc.table.captionTemplate,
            sourceTemplate: (tbl.sourceTemplate as string) ?? bc.table.sourceTemplate,
            alignment: (tbl.tableAlignment as 'CENTER' | 'LEFT' | 'RIGHT') ?? bc.table.alignment,
            fontSizePt: bc.table.fontSizePt,
            numberingStrategy: (tbl.numberingStrategy as 'GLOBAL_SEQUENTIAL' | 'BY_CHAPTER') ?? bc.table.numberingStrategy,
            label: (tbl.label as string) ?? bc.table.label,
            maxWidthCm: bc.table.maxWidthCm,
            widthPercent: (tbl.widthPercent as number) ?? bc.table.widthPercent,
            repeatHeaderOnPageBreak: (tbl.repeatHeaderOnPageBreak as boolean) ?? bc.table.repeatHeaderOnPageBreak,
          };
        }

        // Deserialize frame
        const frm = rule.frame as Record<string, unknown> | undefined;
        if (frm) {
          bc.frame = {
            captionTemplate: (frm.captionTemplate as string) ?? bc.frame.captionTemplate,
            sourceTemplate: (frm.sourceTemplate as string) ?? bc.frame.sourceTemplate,
            alignment: (frm.tableAlignment as 'CENTER' | 'LEFT' | 'RIGHT') ?? bc.frame.alignment,
            fontSizePt: bc.frame.fontSizePt,
            numberingStrategy: (frm.numberingStrategy as 'GLOBAL_SEQUENTIAL' | 'BY_CHAPTER') ?? bc.frame.numberingStrategy,
            label: (frm.label as string) ?? bc.frame.label,
            maxWidthCm: bc.frame.maxWidthCm,
            widthPercent: (frm.widthPercent as number) ?? bc.frame.widthPercent,
            repeatHeaderOnPageBreak: (frm.repeatHeaderOnPageBreak as boolean) ?? bc.frame.repeatHeaderOnPageBreak,
          };
        }

        // Deserialize codeListing
        const code = rule.codeListing as Record<string, unknown> | undefined;
        if (code) {
          bc.codeListing = {
            captionTemplate: (code.captionTemplate as string) ?? bc.codeListing.captionTemplate,
            sourceTemplate: (code.sourceTemplate as string) ?? bc.codeListing.sourceTemplate,
            fontFamily: (code.fontFamily as string) ?? bc.codeListing.fontFamily,
            fontSizePt: bc.codeListing.fontSizePt,
            numberingStrategy: (code.numberingStrategy as 'GLOBAL_SEQUENTIAL' | 'BY_CHAPTER') ?? bc.codeListing.numberingStrategy,
            label: (code.label as string) ?? bc.codeListing.label,
            widthPercent: (code.widthPercent as number) ?? bc.codeListing.widthPercent,
            repeatHeaderOnPageBreak: (code.repeatHeaderOnPageBreak as boolean) ?? bc.codeListing.repeatHeaderOnPageBreak,
          };
        }

        // Deserialize chart (reads imageRule for image-specific fields)
        const chart = rule.chart as Record<string, unknown> | undefined;
        if (chart) {
          const imgRule = chart.imageRule as Record<string, unknown> | undefined;
          bc.chart = {
            captionTemplate: (chart.captionTemplate as string) ?? bc.chart.captionTemplate,
            sourceTemplate: (chart.sourceTemplate as string) ?? bc.chart.sourceTemplate,
            alignment: ((imgRule?.imageAlignment ?? chart.imageAlignment) as 'CENTER' | 'LEFT' | 'RIGHT') ?? bc.chart.alignment,
            fontSizePt: bc.chart.fontSizePt,
            numberingStrategy: (chart.numberingStrategy as 'GLOBAL_SEQUENTIAL' | 'BY_CHAPTER') ?? bc.chart.numberingStrategy,
            label: (chart.label as string) ?? bc.chart.label,
            maxWidthCm: ((imgRule?.maxWidthCm ?? chart.maxWidthCm) as number) ?? bc.chart.maxWidthCm,
            maxHeightCm: ((imgRule?.maxHeightCm ?? chart.maxHeightCm) as number) ?? bc.chart.maxHeightCm,
          };
        }

        comp.bodyContent = bc;
        break;
      }
      case 'SECTIONED': {
        comp.headingTemplate = rule.headingTemplate as string ?? '{letter} — {title}';
        comp.indexingStyle = (rule.indexingStyle as 'ALPHABETIC' | 'NUMERIC') ?? 'ALPHABETIC';
        comp.bodyContentComponentId = rule.bodyContentComponentId as string ?? '';
        comp.sectionTitleStyleIdsByLevel = rule.sectionTitleStyleIdsByLevel as string[] ?? [];
        if (typeof rule.headingStyleId === 'string') comp.headingStyleId = rule.headingStyleId;
        if (typeof rule.paragraphStyleId === 'string') comp.paragraphStyleId = rule.paragraphStyleId;
        break;
      }
      case 'ELEMENT_INDEX': {
        comp.elementType = (rule.elementType as ComponentState['elementType']) ?? 'FIGURE';
        comp.headingText = rule.headingText as string ?? 'LISTA';
        comp.entryTemplate = rule.entryTemplate as string ?? '{number} — {caption}';
        comp.blankLinesAfterHeading = rule.blankLinesAfterHeading as number ?? 1;
        comp.pageReferenceEnabled = (rule.pageReferenceEnabled as boolean) ?? true;
        if (typeof rule.headingStyleId === 'string') comp.headingStyleId = rule.headingStyleId;
        if (typeof rule.entryStyleId === 'string') comp.entryStyleId = rule.entryStyleId;
        if (typeof rule.sourceComponentId === 'string') comp.sourceComponentId = rule.sourceComponentId;
        break;
      }
      case 'SECTION_INDEX': {
        comp.headingText = rule.headingText as string ?? 'SUMÁRIO';
        comp.useTocField = (rule.useTocField as boolean) ?? true;
        comp.blankLinesAfterHeading = rule.blankLinesAfterHeading as number ?? 1;
        comp.entryStyleIdsByLevel = rule.entryStyleIdsByLevel as string[] ?? [];
        if (typeof rule.headingStyleId === 'string') comp.headingStyleId = rule.headingStyleId;
        if (typeof rule.sourceComponentId === 'string') comp.sourceComponentId = rule.sourceComponentId;
        break;
      }
    }

    state.components.push(comp);
  }

  return state;
}
