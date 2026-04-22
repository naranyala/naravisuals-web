/**
 * Reference & Footnote Validator Plugin (STRICT)
 * @ts-nocheck
 */

import type { MarkdownValidator, ValidationIssue, ValidationResult } from "./types.ts";

interface FootnoteEntry {
  identifier: string;
  line: number;
  isReference: boolean; // true if [^1], false if [^1]:
}

interface ExternalLink {
  url: string;
  text: string;
  line: number;
  isValid: boolean;
}

export const referenceValidator: MarkdownValidator = {
  name: "references",
  label: "Reference & Footnote Validator",
  isStrict: true,

  validate(content: string, filePath: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    const lines = content.split("\n");

    const externalLinks: ExternalLink[] = [];
    const internalLinkCount = 0;
    const footnoteEntries: FootnoteEntry[] = [];
    const footnoteIdentifiers = new Set<string>();
    const duplicateIdentifiers: string[] = [];

    let hasReferencesSection = false;
    let referencesSectionLine = -1;
    let referencesSectionEntries = 0;

    // Track code blocks to skip validation inside them
    let inCodeBlock = false;

    // ===== PASS 1: Extract all data =====

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined) continue;

      // Track code blocks
      if (line.trimStart().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;

      // Check for References/See Also section
      const refSectionMatch = line.match(
        /^(#{1,3})\s+(References|See Also|Further Reading|External Links|Notes|Footnotes|Bibliography)/i
      );
      if (refSectionMatch && refSectionMatch[1] !== undefined) {
        hasReferencesSection = true;
        referencesSectionLine = i;
      }

      // Extract external links
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let linkMatch: RegExpExecArray | null;
      while (true) {
        linkMatch = linkRegex.exec(line);
        if (linkMatch === null) break;
        const url = linkMatch[2];
        const text = linkMatch[1];
        if (url === undefined || text === undefined) continue;

        // Skip internal links
        if (
          url.startsWith("/") ||
          url.startsWith("#") ||
          url.startsWith("docs/") ||
          url.startsWith("./") ||
          url.startsWith("../")
        ) {
          continue;
        }

        // Basic URL validation
        const isValidUrl = /^https?:\/\/[^\s]+$/.test(url);

        externalLinks.push({
          url,
          text,
          line: i + 1,
          isValid: isValidUrl,
        });
      }

      // Extract footnote references [^identifier]
      const footnoteRefRegex = /\[\^([^\]]+)\]/g;
      let refMatch: RegExpExecArray | null;
      while (true) {
        refMatch = footnoteRefRegex.exec(line);
        if (refMatch === null) break;
        const identifier = refMatch[1];
        if (identifier === undefined) continue;

        // Check if this is a definition (line starts with [^id]:)
        const isDef = line.trim().startsWith(`[^${identifier}]:`);

        if (!isDef) {
          // This is a reference
          footnoteEntries.push({
            identifier,
            line: i + 1,
            isReference: true,
          });

          // Track for duplicate detection
          if (footnoteIdentifiers.has(`ref:${identifier}`)) {
            issues.push({
              severity: "error",
              file: filePath,
              line: i + 1,
              message: `Duplicate footnote reference: [^${identifier}]`,
              detail:
                "Ensure each footnote is used only once. For repeated references, consider rephrasing or combining notes.",
            });
          }
          footnoteIdentifiers.add(`ref:${identifier}`);
        }
      }

      const footnoteDefRegex = /^\s*\[\^([^\]]+)\]:\s*(.*)$/;
      const defMatch = line.match(footnoteDefRegex);
      if (defMatch) {
        const identifier = defMatch[1];
        const definitionText = defMatch[2];

        if (identifier !== undefined && definitionText !== undefined) {
          footnoteEntries.push({
            identifier,
            line: i + 1,
            isReference: false,
          });

          // Check for empty definitions
          if (!definitionText.trim()) {
            issues.push({
              severity: "error",
              file: filePath,
              line: i + 1,
              message: `Empty footnote definition: [^${identifier}]`,
              detail: "Footnote definitions must contain text content",
            });
          }

          // Check for duplicate definitions
          if (footnoteIdentifiers.has(`def:${identifier}`)) {
            duplicateIdentifiers.push(identifier);
            issues.push({
              severity: "error",
              file: filePath,
              line: i + 1,
              message: `Duplicate footnote definition: [^${identifier}]:`,
              detail: "Each footnote identifier must be unique",
            });
          }
          footnoteIdentifiers.add(`def:${identifier}`);
        }
      }
    }

    // ===== PASS 2: Count reference section entries =====

    if (hasReferencesSection) {
      for (let i = referencesSectionLine + 1; i < lines.length; i++) {
        const line = lines[i];
        if (line === undefined) continue;

        // Stop at next heading
        if (/^#{1,3}\s+/.test(line)) break;

        // Count list items that look like reference entries
        if (/^\s*[-*]\s+\[/.test(line) || /^\s*\d+\.\s+\[/.test(line)) {
          referencesSectionEntries++;
        }
      }

      // Check if reference section is empty
      if (referencesSectionEntries === 0 && externalLinks.length > 0) {
        issues.push({
          severity: "error",
          file: filePath,
          line: referencesSectionLine + 1,
          message: `References section exists but has no link entries`,
          detail: `Found ${externalLinks.length} external link(s) but reference section has 0 entries. Add links as list items: - [Name](URL)`,
        });
      }
    }

    // ===== PASS 3: Validate external links =====

    // Check for invalid URLs
    const invalidUrls = externalLinks.filter((l) => !l.isValid);
    for (const link of invalidUrls) {
      issues.push({
        severity: "error",
        file: filePath,
        line: link.line,
        message: `Invalid external URL: ${link.url}`,
        detail: "External links must start with http:// or https://",
      });
    }

    // Check for external links without references section
    const validExternalLinks = externalLinks.filter((l) => l.isValid);
    if (validExternalLinks.length > 0 && !hasReferencesSection) {
      issues.push({
        severity: "error",
        file: filePath,
        message: `${validExternalLinks.length} external link(s) but no References section`,
        detail:
          "Include a ## References or ## See Also section at the end of the document, listing each external link as bullet points.",
      });
    }

    // Check if all external links are in references section
    const uniqueValidExternalLinks = Array.from(new Set(validExternalLinks.map((l) => l.url)));
    if (
      hasReferencesSection &&
      uniqueValidExternalLinks.length > 0 &&
      referencesSectionEntries > 0
    ) {
      // This is informational - we can't perfectly match URLs, but we can check count
      if (referencesSectionEntries < uniqueValidExternalLinks.length) {
        issues.push({
          severity: "warning",
          file: filePath,
          line: referencesSectionLine + 1,
          message: `References section has ${referencesSectionEntries} entries but article has ${uniqueValidExternalLinks.length} unique external links`,
          detail: "Consider adding all external links to the References section",
        });
      }
    }

    // ===== PASS 4: Validate footnotes =====

    const references = footnoteEntries.filter((e) => e.isReference);
    const definitions = footnoteEntries.filter((e) => !e.isReference);

    const refIdentifiers = new Set(references.map((r) => r.identifier));
    const defIdentifiers = new Set(definitions.map((d) => d.identifier));

    // Check for references without definitions
    const orphanedRefs = references.filter((r) => !defIdentifiers.has(r.identifier));
    for (const orphan of orphanedRefs) {
      issues.push({
        severity: "error",
        file: filePath,
        line: orphan.line,
        message: `Footnote reference [^${orphan.identifier}] has no matching definition`,
        detail: `Provide a definition for the footnote reference. For example: [^${orphan.identifier}]: Brief explanation or source.`,
      });
    }

    // Check for definitions without references (orphaned definitions)
    const orphanedDefs = definitions.filter((d) => !refIdentifiers.has(d.identifier));
    for (const orphan of orphanedDefs) {
      issues.push({
        severity: "error",
        file: filePath,
        line: orphan.line,
        message: `Footnote definition [^${orphan.identifier}]: is never referenced`,
        detail:
          "Either delete unused footnote definitions or include references to these definitions within the article.",
      });
    }

    // Check for mismatched counts (only if no orphaned issues already reported)
    if (orphanedRefs.length === 0 && orphanedDefs.length === 0) {
      if (references.length !== definitions.length) {
        issues.push({
          severity: "error",
          file: filePath,
          message: `Footnote reference count (${references.length}) != definition count (${definitions.length})`,
          detail: "Ensure every [^ref] has a matching [^ref]: definition",
        });
      }
    }

    // ===== Build stats =====

    const stats: Record<string, any> = {
      externalLinks: validExternalLinks.length,
      invalidUrls: invalidUrls.length,
      internalLinks: internalLinkCount,
      hasReferencesSection: hasReferencesSection,
      referencesSectionEntries,
      footnoteReferences: references.length,
      footnoteDefinitions: definitions.length,
      orphanedFootnoteRefs: orphanedRefs.length,
      orphanedFootnoteDefs: orphanedDefs.length,
      duplicateIdentifiers: duplicateIdentifiers.length,
    };

    return {
      checked: validExternalLinks.length + references.length + definitions.length,
      issues,
      stats,
    };
  },
};

export default referenceValidator;
