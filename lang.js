/**
 * AMICO 2000 Emulator - Languages
 *
 * The home page is in English and in Italian. A large part of the people who
 * used this board are Italians who read Sperimentare around 1980, and many of
 * them do not read English.
 *
 * Where the words are:
 *
 * - What the page says standing still is in index.html, both languages side
 *   by side: an element marked data-lang="en" and, straight after it, the same
 *   thing marked data-lang="it". A style rule there hides whichever is not the
 *   language of <html lang>. Nothing is swapped by script, so the page never
 *   shows one language and then the other.
 * - Tooltips and labels for screen readers are attributes, which cannot be
 *   doubled that way. The English is the attribute, the Italian is beside it
 *   as data-it-title, data-it-aria-label or data-it-content, and applyToPage()
 *   below puts the right one in place. data-it-text does the same for an
 *   element's whole text, which is how <title> is done.
 * - What scripts say, the tape's status line and the alerts after a file is
 *   loaded, is in STRINGS below, both languages together, and reaches the page
 *   through t().
 *
 * This file is loaded in <head>, before the page's body is read, so that
 * <html lang> is right before anything is drawn. It knows nothing about the
 * machine, and the machine layer knows nothing about it. main.js joins them.
 *
 * The browser console is not translated. What is logged there is for someone
 * debugging, and stays in English whatever the page shows.
 *
 * guide.html and guida.html are two separate pages and do not use this file.
 */

const AmicoLang = (() => {
    'use strict';

    const LANGUAGES = ['en', 'it'];
    // What the page's own markup is in, and what a visitor gets whose browser
    // asks for neither language.
    const DEFAULT_LANGUAGE = 'en';
    const STORAGE_KEY = 'amico2000.lang';

    // The attributes applyToPage() swaps. `content` is for the <meta> tags a
    // search engine that runs scripts reads.
    const SWAPPED_ATTRIBUTES = ['title', 'aria-label', 'content'];

    /**
     * What scripts say on the page. {name} is replaced by the value of that
     * name. Each entry has both languages; tests/languages.test.js checks that
     * none is missing one and that the two take the same values.
     *
     * The Italian addresses the reader as "voi", as the manual does, and uses
     * the manual's words: "registrazione" for SAVE and "lettura" for LOAD.
     */
    const STRINGS = {
        // Bench controls
        'run': { en: 'Run', it: 'Avvia' },
        'stop': { en: 'Stop', it: 'Ferma' },

        // The NOR/SS slide switch's tooltip, which says where it stands
        'switch.nor': {
            en: 'NOR / SS switch, at NOR: programs run normally. Click for SS, single step.',
            it: 'Commutatore NOR / SS, su NOR: i programmi vengono eseguiti normalmente. Un clic per SS, passo singolo.'
        },
        'switch.ss': {
            en: 'NOR / SS switch, at SS: RUN executes one instruction and shows the address of the next. Click for NOR.',
            it: 'Commutatore NOR / SS, su SS: RUN esegue una sola istruzione e mostra l’indirizzo della successiva. Un clic per NOR.'
        },

        // What a screen reader is told the displays are
        'display.label': {
            en: 'Six seven-segment displays: four address digits, then two data digits',
            it: 'Sei display a sette segmenti: quattro cifre per l’indirizzo, poi due per il dato'
        },

        // The recorder's status line, beside the Cassette buttons
        'tape.recording': { en: 'Recording, {at} s', it: 'Registrazione, {at} s' },
        'tape.empty': { en: 'The cassette is empty. Press RES.', it: 'La cassetta è vuota. Premete RES.' },
        'tape.end': { en: 'End of tape. Press RES.', it: 'Fine del nastro. Premete RES.' },
        'tape.playing': { en: 'Playing, {at} s of {length} s', it: 'Lettura, {at} s di {length} s' },
        'tape.saved': { en: 'Saved program {ids}', it: 'Programma {ids} registrato' },
        'tape.savedSeveral': { en: 'Saved program {ids}', it: 'Programmi registrati: {ids}' },
        'tape.nothingSaved': { en: 'Nothing was saved', it: 'Non è stato registrato nulla' },
        'tape.notSaved': { en: 'Not saved: {why}', it: 'Non registrato: {why}' },
        'tape.notLoaded': { en: 'Not loaded: {why}', it: 'Non caricato: {why}' },
        'tape.loaded': { en: 'Loaded program {id} at ${address}', it: 'Programma {id} caricato a ${address}' },

        // The alert after Load ROM or tape
        'load.done': { en: 'Loaded: {name} ({bytes} bytes)', it: 'Caricato: {name} ({bytes} byte)' },
        'load.error': { en: 'Error loading file: {message}', it: 'Errore nel caricamento del file: {message}' },
        'load.recordingTooLarge': {
            en: '{name} is {size} MB; the largest recording that can be read is {limit} MB. ' +
                'Cut it into shorter pieces, or save it as mono.',
            it: '{name} è di {size} MB; la registrazione più grande che si può leggere è di {limit} MB. ' +
                'Tagliatela in pezzi più corti, oppure salvatela in mono.'
        },
        'load.fileTooLarge': {
            en: '{name} is {size} bytes; the largest file the AMICO 2000 can load is {limit} bytes',
            it: '{name} è di {size} byte; il file più grande che l’AMICO 2000 può caricare è di {limit} byte'
        },

        // What was read from a sound recording of a tape
        'recording.length': { en: '{seconds} s at {rate} Hz', it: '{seconds} s a {rate} Hz' },
        'recording.nothing': {
            en: 'No AMICO 2000 program could be read from {name} ({length}).',
            it: 'Non è stato possibile leggere alcun programma dell’AMICO 2000 da {name} ({length}).'
        },
        'recording.readOne': {
            en: 'Read 1 program from {name} ({length}):',
            it: 'Letto 1 programma da {name} ({length}):'
        },
        'recording.readSeveral': {
            en: 'Read {count} programs from {name} ({length}):',
            it: 'Letti {count} programmi da {name} ({length}):'
        },
        'recording.program': {
            en: '  {id}: ${start}-${end}, {bytes} bytes, at {time} s',
            it: '  {id}: ${start}-${end}, {bytes} byte, a {time} s'
        },
        'recording.howToLoad': {
            en: 'To load one, put its number in $0000 and run from $FC54.',
            it: 'Per caricarne uno, mettete il suo numero in $0000 e fate partire da $FC54.'
        },
        'recording.notRead': { en: 'Not read:', it: 'Non letti:' }
    };

    /** The language a tag such as "it-IT" or "en" names, if the page has it. */
    function supported(tag) {
        if (typeof tag !== 'string') return null;
        const code = tag.trim().toLowerCase().split(/[-_]/)[0];
        return LANGUAGES.includes(code) ? code : null;
    }

    /**
     * Which language to open in. In order: the one the address asks for with
     * ?lang=, which is how the Italian guide links back here; the one this
     * visitor chose before; the first of the browser's languages that the
     * page has; and English.
     *
     * The browser's list is read in its own order, so someone whose browser
     * says German, then Italian, gets Italian, and someone whose browser says
     * English, then Italian, gets English.
     *
     * @param {{search?: string, stored?: string|null, browser?: string[]}} from
     * @returns {string} 'en' or 'it'
     */
    function choose({ search = '', stored = null, browser = [] } = {}) {
        const asked = /[?&]lang=([^&#]*)/.exec(search);
        if (asked && supported(asked[1])) return supported(asked[1]);
        if (supported(stored) === stored && stored) return stored;
        for (const tag of browser) {
            if (supported(tag)) return supported(tag);
        }
        return DEFAULT_LANGUAGE;
    }

    /**
     * A string in a language, with its values filled in.
     *
     * @param {string} key - A key of STRINGS
     * @param {object} [values] - What to put for each {name}
     * @param {string} [language] - Defaults to the page's language. The
     *     console messages ask for 'en' whatever the page shows.
     */
    function t(key, values = {}, language = current) {
        const entry = STRINGS[key];
        if (!entry) throw new Error(`No string called ${key}`);
        const text = entry[language] !== undefined ? entry[language] : entry[DEFAULT_LANGUAGE];
        return text.replace(/\{(\w+)\}/g, (whole, name) => (name in values ? String(values[name]) : whole));
    }

    /**
     * A number with a fixed count of decimals, as the language writes it:
     * Italian has a comma where English has a point.
     */
    function decimal(value, digits, language = current) {
        const text = value.toFixed(digits);
        return language === 'it' ? text.replace('.', ',') : text;
    }

    // ------------------------------------------------------------------
    // The page. Everything below needs a document; the functions above do
    // not, so that the Node tests can use them.
    // ------------------------------------------------------------------

    const inBrowser = typeof document !== 'undefined';
    const listeners = [];

    function readStored() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (err) {
            // Storage blocked (a private window, site data refused): the
            // browser's language decides, every visit.
            return null;
        }
    }

    let current = DEFAULT_LANGUAGE;
    if (inBrowser) {
        const asked = /[?&]lang=([^&#]*)/.exec(location.search);
        current = choose({
            search: location.search,
            stored: readStored(),
            browser: navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]
        });
        // Someone sent here by a link that names a language wants that
        // language on the next visit too.
        if (asked && supported(asked[1])) remember(current);
        // Now, while only <head> exists: the style rule that shows one
        // language and hides the other reads this attribute.
        document.documentElement.lang = current;
    }

    function remember(language) {
        try {
            localStorage.setItem(STORAGE_KEY, language);
        } catch (err) {
            // Storage blocked: the choice lasts until the page is reloaded.
        }
    }

    /**
     * Put the attributes and whole-text elements into the page's language.
     * The English is what the markup has; it is kept beside the Italian the
     * first time it is replaced, as data-en-..., so that it can come back.
     */
    function applyToPage() {
        document.documentElement.lang = current;
        for (const name of SWAPPED_ATTRIBUTES) {
            document.querySelectorAll(`[data-it-${name}]`).forEach((element) => {
                if (!element.hasAttribute(`data-en-${name}`)) {
                    element.setAttribute(`data-en-${name}`, element.getAttribute(name) || '');
                }
                element.setAttribute(name, element.getAttribute(`data-${current}-${name}`));
            });
        }
        document.querySelectorAll('[data-it-text]').forEach((element) => {
            if (!element.hasAttribute('data-en-text')) {
                element.setAttribute('data-en-text', element.textContent);
            }
            element.textContent = element.getAttribute(`data-${current}-text`);
        });
    }

    /**
     * Change the page's language, where it stands: nothing is reloaded, so
     * the machine and whatever is in its memory are not disturbed.
     */
    function set(language) {
        if (!LANGUAGES.includes(language) || language === current) return;
        current = language;
        remember(language);
        // An address that names a language would bring the old one back on a
        // reload. Not every browser lets a page opened from a file change its
        // address; the page works the same without.
        try {
            const url = new URL(location.href);
            if (url.searchParams.has('lang')) {
                url.searchParams.set('lang', language);
                history.replaceState(history.state, '', url);
            }
        } catch (err) {
            // Leave the address as it is.
        }
        applyToPage();
        listeners.forEach((listener) => listener(language));
    }

    /** Call `listener` with the new language whenever it changes. */
    function onChange(listener) {
        listeners.push(listener);
    }

    if (inBrowser) {
        // Registered before main.js is loaded, so it runs before main.js's
        // own startup: the tooltips are already in the page's language when
        // main.js takes its pictures of the keys for the handheld layout.
        document.addEventListener('DOMContentLoaded', () => {
            applyToPage();
            document.querySelectorAll('[data-set-lang]').forEach((button) => {
                button.addEventListener('click', () => set(button.getAttribute('data-set-lang')));
            });
        });
    }

    return {
        LANGUAGES,
        DEFAULT_LANGUAGE,
        STORAGE_KEY,
        STRINGS,
        choose,
        t,
        decimal,
        set,
        onChange,
        get current() { return current; }
    };
})();

// Export for the Node tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AmicoLang };
}
