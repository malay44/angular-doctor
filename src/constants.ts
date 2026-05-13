export const SOURCE_FILE_PATTERN = /\.ts$/;

export const MILLISECONDS_PER_SECOND = 1000;

export const PERFECT_SCORE = 100;

export const SCORE_GOOD_THRESHOLD = 75;

export const SCORE_OK_THRESHOLD = 50;

export const SCORE_BAR_WIDTH_CHARS = 50;

export const SUMMARY_BOX_HORIZONTAL_PADDING_CHARS = 1;

export const SUMMARY_BOX_OUTER_INDENT_CHARS = 2;

export const GIT_LS_FILES_MAX_BUFFER_BYTES = 50 * 1024 * 1024;

export const MAX_KNIP_RETRIES = 5;

export const ERROR_RULE_PENALTY = 1.5;

export const WARNING_RULE_PENALTY = 0.75;

export const DEFAULT_BRANCH_CANDIDATES = ["main", "master"];

// Plugin thresholds (all configurable via angular-doctor.config.json)
export const GIANT_COMPONENT_LINE_THRESHOLD = 300;
export const GIANT_CLASS_MEMBER_THRESHOLD = 20;
export const LONG_METHOD_LINE_THRESHOLD = 40;
export const LONG_PARAMETER_LIST_THRESHOLD = 4;
export const BOOLEAN_PROP_THRESHOLD = 4;
export const MESSAGE_CHAIN_DEPTH_THRESHOLD = 3;
export const PROPERTY_ACCESS_REPEAT_THRESHOLD = 3;
export const SECRET_MIN_LENGTH_CHARS = 24;
export const DATA_CLUMP_MIN_OCCURRENCES = 3;
export const MIDDLE_MAN_MIN_DELEGATION_RATIO = 1.0;
export const FEATURE_ENVY_MIN_RATIO = 2.0;
export const COMPONENT_STYLE_WARN_KB = 6;
export const COMPONENT_STYLE_ERROR_KB = 10;

export const IGNORED_DIRECTORIES = new Set([
  "dist",
  ".angular",
  "out-tsc",
  "coverage",
  "node_modules",
  ".cache",
  ".git",
  "tmp",
  ".tmp",
]);

export const SECRET_PATTERNS = [
  /(?:api|app|private|secret|auth)[_-]?key/i,
  /(?:aws|github|stripe|sendgrid|twilio)[_-]?(?:secret|key|token)/i,
  /bearer\s+[a-zA-Z0-9\-._~+/]+=*/i,
  /eyJ[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]*/,
  /AKIA[0-9A-Z]{16}/,
] as const;

export const FORBIDDEN_IMPORT_DEFAULTS = [
  // These are opt-in — empty by default
] as const;
