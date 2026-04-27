import { AVAILABLE_CODE_FONT_SIZES, AVAILABLE_FONTS, AVAILABLE_THEMES } from "../../core/constants";
import { Modal } from "../../shared/components/Modal";

interface SettingsPanelProps {
  onClose: () => void;
  codeTheme: string;
  setCodeTheme: (id: string) => void;
  font: string;
  setFont: (id: string) => void;
  codeFontSize: string;
  setCodeFontSize: (id: string) => void;
}

export function SettingsPanel({
  onClose,
  codeTheme,
  setCodeTheme,
  font,
  setFont,
  codeFontSize,
  setCodeFontSize,
}: SettingsPanelProps) {
  return (
    <Modal isOpen={true} onClose={onClose} title="Settings">
      {/* Theme */}
      <div className="settings-section">
        <div className="settings-label">Theme</div>
        <div className="theme-grid">
          {AVAILABLE_THEMES.map((t) => (
            <button
              type="button"
              key={t.id}
              className={`theme-chip ${codeTheme === t.id ? "active" : ""}`}
              onClick={() => setCodeTheme(t.id)}
            >
              <span className="theme-chip-preview" data-theme={t.id}>
                <span className="theme-chip-colors">
                  <span className="chip-bg" style={{ background: t.bg }} />
                  <span className="chip-accent" style={{ background: t.accent }} />
                </span>
              </span>
              <span className="theme-chip-label">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Family */}
      <div className="settings-section">
        <div className="settings-label">Font</div>
        <div className="font-grid">
          {AVAILABLE_FONTS.map((f) => (
            <button
              type="button"
              key={f.id}
              className={`font-chip ${font === f.id ? "active" : ""}`}
              onClick={() => setFont(f.id)}
              style={{ fontFamily: f.css }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Code Font Size */}
      <div className="settings-section">
        <div className="settings-label">Code Text Size</div>
        <div className="font-grid">
          {AVAILABLE_CODE_FONT_SIZES.map((s) => (
            <button
              type="button"
              key={s.id}
              className={`font-chip ${codeFontSize === s.id ? "active" : ""}`}
              onClick={() => setCodeFontSize(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
