import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, File, FileCode2, FileImage, FileText, Folder, FolderOpen } from "lucide-react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { fade, springSnappy, springSoft } from "../../motion";

export type TreeNode = { id: string; name: string; icon?: ReactNode; children?: TreeNode[]; meta?: string };

/** Icons used by TreeView. Pass a partial via `icons` to swap any of them. A node's own `icon` wins. */
export interface TreeViewIcons {
  /** The caret on a folder; it turns when the folder opens. */
  chevron: ReactNode;
  /** A closed folder. */
  folder: ReactNode;
  /** An open folder. */
  folderOpen: ReactNode;
  /** A file with no better match. */
  file: ReactNode;
  /** An image file. */
  fileImage: ReactNode;
  /** A code or data file. */
  fileCode: ReactNode;
  /** A text or document file. */
  fileText: ReactNode;
}
export const treeViewIcons: TreeViewIcons = {
  chevron: <ChevronRight />,
  folder: <Folder />,
  folderOpen: <FolderOpen />,
  file: <File />,
  fileImage: <FileImage />,
  fileCode: <FileCode2 />,
  fileText: <FileText />,
};

export type TreeViewProps = {
  nodes: TreeNode[];
  /** Controlled selected node id, or `null` for none. Leave out to let the tree keep its own. */
  selected?: string | null;
  /** Where the uncontrolled selection starts. Default none. */
  defaultSelected?: string | null;
  /** Called when a node is selected, controlled or not. */
  onSelect?: (id: string, node: TreeNode) => void;
  /** Controlled open folder ids. Leave out to let the tree keep its own. */
  expanded?: string[];
  /** Where the uncontrolled open folders start. Default none. */
  defaultExpanded?: string[];
  /** Called with the open folder ids after a folder opens or closes, controlled or not. */
  onExpandedChange?: (expanded: string[]) => void;
  label: string;
  /** Replace any built-in icon. Merged over `treeViewIcons`. */
  icons?: Partial<TreeViewIcons>;
  className?: string;
};

type Flat = { node: TreeNode; level: number; parent: string | null; setSize: number; pos: number };

function fileIcon(name: string): "fileImage" | "fileCode" | "fileText" | "file" {
  if (/\.(png|jpe?g|gif|svg|webp)$/i.test(name)) return "fileImage";
  if (/\.(tsx?|jsx?|css|json|py|rs)$/i.test(name)) return "fileCode";
  if (/\.(md|txt|pdf|docx?)$/i.test(name)) return "fileText";
  return "file";
}

/**
 * A file explorer tree (WAI-ARIA tree pattern). Up/Down move, Right opens or
 * steps in, Left closes or steps out, Home/End jump, * opens siblings,
 * Enter/Space selects, and typing jumps to a name.
 */
export function TreeView({
  nodes, selected: selectedProp, defaultSelected = null, onSelect, expanded: expandedProp, defaultExpanded = [], onExpandedChange, label, icons, className,
}: TreeViewProps) {
  const ic = useMemo(() => ({ ...treeViewIcons, ...icons }), [icons]);
  const id = useId();
  const [selected, setSelected] = useControllable<string | null>(selectedProp, defaultSelected);
  const [expandedList, setExpandedList] = useControllable<string[]>(expandedProp, defaultExpanded, onExpandedChange);
  const expanded = useMemo(() => new Set(expandedList), [expandedList]);
  const pick = (nid: string, node: TreeNode) => {
    setSelected(nid);
    onSelect?.(nid, node);
  };
  const [focusId, setFocusId] = useState<string | null>(selected ?? nodes[0]?.id ?? null);
  const rootRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });

  const { all, visible } = useMemo(() => {
    const all = new Map<string, Flat>();
    const visible: Flat[] = [];
    const walk = (list: TreeNode[], level: number, parent: string | null, show: boolean) => {
      list.forEach((node, i) => {
        const f = { node, level, parent, setSize: list.length, pos: i + 1 };
        all.set(node.id, f);
        if (show) visible.push(f);
        if (node.children) walk(node.children, level + 1, node.id, show && expanded.has(node.id));
      });
    };
    walk(nodes, 1, null, true);
    return { all, visible };
  }, [nodes, expanded]);

  const focus = (nid: string) => {
    setFocusId(nid);
    requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>(`[data-node="${CSS.escape(nid)}"]`)?.focus());
  };
  const toggle = (nid: string, open?: boolean) =>
    setExpandedList((cur) => {
      const want = open ?? !cur.includes(nid);
      return want ? (cur.includes(nid) ? cur : [...cur, nid]) : cur.filter((x) => x !== nid);
    });

  const onKey = (e: KeyboardEvent) => {
    const at = visible.findIndex((f) => f.node.id === focusId);
    const cur = visible[at];
    if (!cur) return;
    const isFolder = !!cur.node.children;
    const open = expanded.has(cur.node.id);
    let handled = true;
    switch (e.key) {
      case "ArrowDown": if (visible[at + 1]) focus(visible[at + 1].node.id); break;
      case "ArrowUp": if (visible[at - 1]) focus(visible[at - 1].node.id); break;
      case "Home": focus(visible[0].node.id); break;
      case "End": focus(visible[visible.length - 1].node.id); break;
      case "ArrowRight":
        if (isFolder && !open) toggle(cur.node.id, true);
        else if (isFolder && cur.node.children?.length) focus(cur.node.children[0].id);
        break;
      case "ArrowLeft":
        if (isFolder && open) toggle(cur.node.id, false);
        else if (cur.parent) focus(cur.parent);
        break;
      case "Enter":
      case " ":
        pick(cur.node.id, cur.node);
        if (isFolder && e.key === "Enter") toggle(cur.node.id);
        break;
      case "*": {
        const siblings = cur.parent ? all.get(cur.parent)?.node.children ?? [] : nodes;
        setExpandedList((cur) => [...new Set([...cur, ...siblings.filter((n) => n.children).map((n) => n.id)])]);
        break;
      }
      default:
        handled = false;
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const now = Date.now();
          typed.current.text = now - typed.current.at > 600 ? e.key : typed.current.text + e.key;
          typed.current.at = now;
          const q = typed.current.text.toLowerCase();
          const order = [...visible.slice(at + 1), ...visible.slice(0, at + 1)];
          const hit = order.find((f) => f.node.name.toLowerCase().startsWith(q));
          if (hit) focus(hit.node.id);
          handled = true;
        }
    }
    if (handled) e.preventDefault();
  };

  const renderLevel = (list: TreeNode[], level: number): ReactNode =>
    list.map((node, i) => {
      const isFolder = !!node.children;
      const open = expanded.has(node.id);
      const isSel = node.id === selected;
      const fileKey = isFolder ? null : fileIcon(node.name);
      return (
        <li
          key={node.id}
          role="treeitem"
          aria-level={level}
          aria-setsize={list.length}
          aria-posinset={i + 1}
          aria-expanded={isFolder ? open : undefined}
          aria-selected={isSel}
          className="outline-none"
        >
          <div
            data-node={node.id}
            tabIndex={focusId === node.id ? 0 : -1}
            onFocus={() => setFocusId(node.id)}
            onClick={() => {
              setFocusId(node.id);
              pick(node.id, node);
              if (isFolder) toggle(node.id);
            }}
            className={cn(
              "flex h-8 cursor-default select-none items-center gap-1.5 rounded-[6px] pr-2 text-[13px] outline-offset-[-2px] transition-colors duration-150",
              isSel ? "bg-accent-soft text-ink" : "text-ink hover:bg-raised",
            )}
            style={{ paddingLeft: 6 + (level - 1) * 16 }}
          >
            <span className="grid size-4 shrink-0 place-items-center text-muted">
              {isFolder && (
                <motion.span initial={false} animate={{ rotate: open ? 90 : 0 }} transition={springSnappy} className="grid [&>svg]:size-3.5">
                  {ic.chevron}
                </motion.span>
              )}
            </span>
            <span className="grid size-4 shrink-0 place-items-center text-muted [&>*]:[grid-area:1/1]">
              {isFolder ? (
                <>
                  <motion.span initial={false} animate={{ opacity: open ? 0 : 1 }} transition={fade} className="grid [&>svg]:size-4">{ic.folder}</motion.span>
                  <motion.span initial={false} animate={{ opacity: open ? 1 : 0 }} transition={fade} className="grid [&>svg]:size-4">{ic.folderOpen}</motion.span>
                </>
              ) : node.icon ? (
                <span className="grid [&>svg]:size-4">{node.icon}</span>
              ) : fileKey ? (
                <span className="grid [&>svg]:size-4">{ic[fileKey]}</span>
              ) : null}
            </span>
            <span className="min-w-0 flex-1 truncate">{node.name}</span>
            {node.meta && <span className="shrink-0 text-xs text-muted tabular">{node.meta}</span>}
          </div>
          {isFolder && (
            <AnimatePresence initial={false}>
              {open && (
                <motion.ul
                  key="group"
                  role="group"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ height: springSoft, opacity: fade }}
                  className="overflow-hidden"
                >
                  {renderLevel(node.children!, level + 1)}
                </motion.ul>
              )}
            </AnimatePresence>
          )}
        </li>
      );
    });

  return (
    <ul ref={rootRef} id={id} role="tree" aria-label={label} onKeyDown={onKey} className={cn("flex flex-col text-ink", className)}>
      {renderLevel(nodes, 1)}
    </ul>
  );
}
