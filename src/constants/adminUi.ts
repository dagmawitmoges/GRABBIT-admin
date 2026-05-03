/** Shared admin UI tokens — primary brand matches Sidebar (#1DB954) */
export const adminUi = {
  primary: "#1DB954",
  primaryHover: "#18a04a",
  pageBg: "min-h-screen flex bg-gray-50 dark:bg-gray-950",
  content: "p-4 sm:p-6 md:p-8 w-full min-w-0",
  contentNarrow: "p-4 sm:p-6 md:p-8 w-full min-w-0 max-w-3xl mx-auto",
  contentWide: "p-4 sm:p-6 md:p-8 w-full min-w-0 max-w-5xl mx-auto",
  h1: "text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight",
  subtitle: "text-sm text-gray-500 dark:text-gray-400 mt-1",
  card: "bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-6 md:p-8",
  sectionTitle:
    "text-base font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-3 mb-5",
  label: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
  labelHint: "text-xs font-normal text-gray-400 ml-1",
  input:
    "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954]/25 focus:border-[#1DB954] transition",
  select:
    "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-[#1DB954]/25 focus:border-[#1DB954]",
  textarea:
    "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 placeholder:text-gray-400 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#1DB954]/25 focus:border-[#1DB954]",
  primaryBtn:
    "inline-flex items-center justify-center rounded-lg bg-[#1DB954] text-white font-semibold px-5 py-2.5 hover:bg-[#18a04a] disabled:opacity-50 disabled:pointer-events-none transition shadow-sm",
  primaryBtnSm:
    "inline-flex items-center justify-center rounded-lg bg-[#1DB954] text-white font-medium px-3 py-1.5 text-sm hover:bg-[#18a04a] disabled:opacity-50 transition",
  dangerBtnSm:
    "inline-flex items-center justify-center rounded-lg bg-red-600 text-white font-medium px-3 py-1.5 text-sm hover:bg-red-700 disabled:opacity-50 transition",
  secondaryBtn:
    "inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-medium px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition",
  dangerOutlineBtn:
    "inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-medium px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm",
  errorText: "text-sm text-red-600 dark:text-red-400 mt-1",
  globalError:
    "rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 text-red-700 dark:text-red-300 text-sm px-4 py-3",
  toolbarRow: "flex flex-wrap items-center gap-3",
} as const;
