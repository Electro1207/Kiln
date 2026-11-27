import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "../../cn";
import { Button } from "../buttons/Button";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { DropdownMenu, type MenuEntry } from "../menus/DropdownMenu";

/** Icons used by CollapsingActions. Pass a partial via `icons` to replace any. */
export interface CollapsingActionsIcons {
  /** The overflow button on phones. */
  more: ReactNode;
}
export const collapsingActionsIcons: CollapsingActionsIcons = { more: <MoreHorizontal /> };

/** Text used by CollapsingActions. Pass a partial via `labels` to translate or reword. */
export interface CollapsingActionsLabels {
  /** Label of the overflow menu and its button on phones. */
  moreActions: string;
}
export const collapsingActionsLabels: CollapsingActionsLabels = { moreActions: "More actions" };

export type HeadingAction = { label: string; icon?: ReactNode; onSelect?: () => void; primary?: boolean; danger?: boolean };

/**
 * A heading's actions. From 640px wide screens every action is a button; on
 * phones the secondary ones fold into a "More" menu and only the primary
 * action stays. Put it in PageHeading's `actions`.
 */
export function CollapsingActions({ actions, className, labels, icons, accessibilityFeatures }: {
  actions: HeadingAction[];
  className?: string;
  /** Override any UI text. Merged over `collapsingActionsLabels`. */
  labels?: Partial<CollapsingActionsLabels>;
  /** Replace any built-in icon. Merged over `collapsingActionsIcons`. */
  icons?: Partial<CollapsingActionsIcons>;
  /** Accessibility features to add for this one component. Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
}) {
  const { rootProps } = useA11yProps(accessibilityFeatures);
  const l = { ...collapsingActionsLabels, ...labels };
  const ic = { ...collapsingActionsIcons, ...icons };
  const primary = actions.find((a) => a.primary);
  const rest = actions.filter((a) => !a.primary);
  const menu: MenuEntry[] = rest.map((a) => ({ label: a.label, icon: a.icon, onSelect: a.onSelect, danger: a.danger }));
  return (
    <div {...rootProps} className={cn("flex min-w-0 justify-end", className)}>
      <div className="flex items-center gap-2">
        {/* The wrapper hides them: Button's own inline-flex would beat a `hidden` on it. */}
        {rest.length > 0 && (
          <div className="hidden items-center gap-2 sm:flex">
            {rest.map((a) => (
              <Button key={a.label} variant="secondary" size="sm" leading={a.icon} onClick={a.onSelect}>
                {a.label}
              </Button>
            ))}
          </div>
        )}
        {rest.length > 0 && (
          <div className="sm:hidden">
            <DropdownMenu
              label={l.moreActions}
              placement="bottom-end"
              items={menu}
              trigger={({ open, ...p }) => (
                <Button {...p} variant="secondary" size="sm" aria-label={l.moreActions} className={cn("w-8 px-0", open && "bg-btn-secondary-hover")}>
                  <span className="grid [&>svg]:size-4" aria-hidden>{ic.more}</span>
                </Button>
              )}
            />
          </div>
        )}
        {primary && (
          <Button size="sm" leading={primary.icon} onClick={primary.onSelect}>
            {primary.label}
          </Button>
        )}
      </div>
    </div>
  );
}

/** The top of a card: a picture, a title and a line of meta, with an action on the right. */
export function CardHeading({ title, meta, leading, action, className, accessibilityFeatures }: { title: ReactNode; meta?: ReactNode; leading?: ReactNode; action?: ReactNode; className?: string; accessibilityFeatures?: AccessibilityFeaturesProp }) {
  const { rootProps } = useA11yProps(accessibilityFeatures);
  return (
    <div {...rootProps} className={cn("flex min-w-0 items-center gap-3", className)}>
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[0.9375rem] font-semibold text-ink">{title}</h3>
        {meta && <p className="truncate text-[0.8125rem] text-muted">{meta}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
