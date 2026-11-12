import { useCallback, useEffect, useId, useMemo, useRef, useState, type DragEvent, type KeyboardEvent, type MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronRight, File as FileIcon, FileArchive, FileCode2, FileImage, FileText, Folder, FolderOpen, FolderPlus, LayoutGrid, List, Pencil, Trash2,
} from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springSoft } from "../../motion";
import { MenuContent, type MenuEntry } from "../menus/DropdownMenu";
import { SegmentedControl } from "../buttons/SegmentedControl";

export type FMNode = { id: string; name: string; kind: "folder" | "file"; parent: string | null; size?: number; modified?: string };

export type FileManagerProps = {
  initial: FMNode[];
  rootName?: string;
  onOpenFile?: (node: FMNode) => void;
  onChange?: (nodes: FMNode[]) => void;
  /** Override any UI text. Merged over `fileManagerLabels`. */
  labels?: Partial<Omit<FileManagerLabels, "menu">> & { menu?: Partial<FileManagerLabels["menu"]> };
  className?: string;
};

/** Text used by FileManager. Pass a partial via `labels` to translate or reword. */
export interface FileManagerLabels {
  /** aria-label of the breadcrumb nav. */
  folderPath: string;
  /** New-folder button text. */
  newFolder: string;
  /** aria-label of the view switch. */
  view: string;
  /** Grid view option (screen-reader text). */
  grid: string;
  /** List view option (screen-reader text). */
  list: string;
  /** List column heading. */
  name: string;
  /** List column heading. */
  modified: string;
  /** List column heading. */
  size: string;
  /** Shown where a size or date is missing. */
  none: string;
  /** File size text, e.g. "12 KB". Receives undefined when unknown. */
  fileSize: (bytes?: number) => string;
  /** Item count of a folder in the list view: "3 items". */
  items: (count: number) => string;
  /** Footer count: "3 items". */
  itemCount: (count: number) => string;
  /** Footer selection count: "2 of 9 selected". */
  selectedOf: (selected: number, total: number) => string;
  /** Footer hint. `mod` is the platform's modifier key name. */
  hint: (mod: string) => string;
  /** aria-label of the file list: "Home, 4 items". */
  listLabel: (folder: string, count: number) => string;
  /** Empty-folder title. */
  emptyTitle: string;
  /** Empty-folder hint. */
  emptyHint: string;
  /** Name given to a new folder (numbered when taken). */
  untitledFolder: string;
  /** Modified text of a just-created or renamed item. */
  justNow: string;
  /** aria-label of the rename input. */
  newName: string;
  /** aria-label of the context menu. */
  fileActions: string;
  /** Live announcement after opening a folder. */
  opened: (name: string) => string;
  /** Live announcement after deleting. */
  deleted: (count: number) => string;
  /** Live announcement after moving. */
  moved: (count: number, to: string) => string;
  /** Context menu entries. */
  menu: {
    newFolder: string;
    selectAll: string;
    openFolder: string;
    openFile: string;
    rename: string;
    moveTo: string;
    moveManyTo: (count: number) => string;
    delete: string;
    deleteMany: (count: number) => string;
  };
}
export const fileManagerLabels: FileManagerLabels = {
  folderPath: "Folder path",
  newFolder: "New folder",
  view: "View",
  grid: "Grid",
  list: "List",
  name: "Name",
  modified: "Modified",
  size: "Size",
  none: "—",
  fileSize: (n) => (n == null ? "—" : n < 1024 ? `${n} B` : n < 1024 ** 2 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 ** 2).toFixed(1)} MB`),
  items: (n) => `${n} items`,
  itemCount: (n) => `${n} item${n === 1 ? "" : "s"}`,
  selectedOf: (n, total) => `${n} of ${total} selected`,
  hint: (mod) => `Shift or ${mod} to select several · drag onto a folder to move`,
  listLabel: (folder, n) => `${folder}, ${n} items`,
  emptyTitle: "This folder is empty",
  emptyHint: "Drag files here, or make a new folder.",
  untitledFolder: "Untitled folder",
  justNow: "Just now",
  newName: "New name",
  fileActions: "File actions",
  opened: (name) => `Opened ${name}`,
  deleted: (n) => `Deleted ${n} item${n > 1 ? "s" : ""}`,
  moved: (n, to) => `Moved ${n} item${n > 1 ? "s" : ""} to ${to}`,
  menu: {
    newFolder: "New folder",
    selectAll: "Select all",
    openFolder: "Open",
    openFile: "Open file",
    rename: "Rename",
    moveTo: "Move to",
    moveManyTo: (n) => `Move ${n} items to`,
    delete: "Delete",
    deleteMany: (n) => `Delete ${n} items`,
  },
};

function iconFor(n: FMNode, open = false) {
  if (n.kind === "folder") return open ? FolderOpen : Folder;
  if (/\.(png|jpe?g|gif|svg|webp)$/i.test(n.name)) return FileImage;
  if (/\.(zip|tar|gz|7z)$/i.test(n.name)) return FileArchive;
  if (/\.(tsx?|jsx?|py|json|css)$/i.test(n.name)) return FileCode2;
  if (/\.(md|txt|pdf|docx?|key)$/i.test(n.name)) return FileText;
  return FileIcon;
}

let seq = 0;
const newId = () => `n${Date.now().toString(36)}${(seq++).toString(36)}`;

/**
 * A small file manager: grid or list, breadcrumbs, click / Shift / Cmd-or-Ctrl
 * selection, drag files onto folders (or onto a breadcrumb to move them up),
 * rename in place (F2), a context menu, and an empty-folder state.
 * Keyboard: arrows move, Shift+arrows extend, Space toggles, Enter opens,
 * Backspace goes up, Delete removes, Cmd/Ctrl+A selects all.
 */
export function FileManager({ initial, rootName = "Home", onOpenFile, onChange, labels, className }: FileManagerProps) {
  const l = { ...fileManagerLabels, ...labels } as FileManagerLabels;
  const lm = { ...fileManagerLabels.menu, ...labels?.menu };
  const id = useId();
  const [nodes, setNodesState] = useState<FMNode[]>(initial);
  const [cwd, setCwd] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [focusId, setFocusId] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; target: string | null; n: number } | null>(null);
  const [said, setSaid] = useState("");
  const areaRef = useRef<HTMLDivElement>(null);
  const dragIds = useRef<string[]>([]);

  const setNodes = (next: FMNode[]) => {
    setNodesState(next);
    onChange?.(next);
  };

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const children = useMemo(
    () =>
      nodes
        .filter((n) => n.parent === cwd)
        .sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name, undefined, { numeric: true }) : a.kind === "folder" ? -1 : 1)),
    [nodes, cwd],
  );
  const path = useMemo(() => {
    const out: FMNode[] = [];
    let c = cwd ? byId.get(cwd) : undefined;
    while (c) {
      out.unshift(c);
      c = c.parent ? byId.get(c.parent) : undefined;
    }
    return out;
  }, [cwd, byId]);

  const isInside = (folder: string, maybeChild: string): boolean => {
    let c = byId.get(folder);
    while (c) {
      if (c.id === maybeChild) return true;
      c = c.parent ? byId.get(c.parent) : undefined;
    }
    return false;
  };

  const open = (n: FMNode) => {
    if (n.kind === "folder") {
      setCwd(n.id);
      setSel(new Set());
      setFocusId(null);
      setAnchor(null);
      setSaid(l.opened(n.name));
    } else onOpenFile?.(n);
  };
  const goTo = (folder: string | null) => {
    setCwd(folder);
    setSel(new Set());
    setFocusId(null);
    setAnchor(null);
  };

  const focusItem = useCallback((nid: string) => {
    setFocusId(nid);
    requestAnimationFrame(() => areaRef.current?.querySelector<HTMLElement>(`[data-node="${CSS.escape(nid)}"]`)?.focus({ preventScroll: false }));
  }, []);

  const clickItem = (e: ReactMouseEvent, n: FMNode) => {
    e.stopPropagation();
    if (renaming) return;
    const order = children.map((c) => c.id);
    if (e.shiftKey && anchor) {
      const [a, b] = [order.indexOf(anchor), order.indexOf(n.id)].sort((x, y) => x - y);
      setSel(new Set(order.slice(a, b + 1)));
    } else if (e.metaKey || e.ctrlKey) {
      const next = new Set(sel);
      if (next.has(n.id)) next.delete(n.id);
      else next.add(n.id);
      setSel(next);
      setAnchor(n.id);
    } else {
      setSel(new Set([n.id]));
      setAnchor(n.id);
    }
    setFocusId(n.id);
  };

  const remove = (ids: string[]) => {
    const gone = new Set<string>();
    const walk = (pid: string) => {
      gone.add(pid);
      nodes.filter((n) => n.parent === pid).forEach((n) => walk(n.id));
    };
    ids.forEach(walk);
    setNodes(nodes.filter((n) => !gone.has(n.id)));
    setSel(new Set());
    setSaid(l.deleted(ids.length));
    requestAnimationFrame(() => areaRef.current?.focus());
  };

  const move = (ids: string[], folder: string | null) => {
    const ok = ids.filter((i) => i !== folder && !(folder && isInside(folder, i)) && byId.get(i)?.parent !== folder);
    if (!ok.length) return;
    setNodes(nodes.map((n) => (ok.includes(n.id) ? { ...n, parent: folder } : n)));
    setSel(new Set());
    setSaid(l.moved(ok.length, (folder ? byId.get(folder)?.name : rootName) ?? ""));
  };

  const newFolder = () => {
    const base = l.untitledFolder;
    let name = base;
    for (let i = 2; children.some((c) => c.name === name); i++) name = `${base} ${i}`;
    const n: FMNode = { id: newId(), name, kind: "folder", parent: cwd, modified: l.justNow };
    setNodes([...nodes, n]);
    setSel(new Set([n.id]));
    setFocusId(n.id);
    setRenaming(n.id);
  };

  const commitRename = (nid: string, name: string) => {
    const clean = name.trim();
    const n = byId.get(nid);
    setRenaming(null);
    if (!n || !clean || clean === n.name || children.some((c) => c.id !== nid && c.name === clean)) {
      focusItem(nid);
      return;
    }
    setNodes(nodes.map((x) => (x.id === nid ? { ...x, name: clean, modified: l.justNow } : x)));
    focusItem(nid);
  };

  const columns = () => {
    const els = Array.from(areaRef.current?.querySelectorAll<HTMLElement>("[data-node]") ?? []);
    if (view === "list" || els.length < 2) return 1;
    const top = els[0].offsetTop;
    return Math.max(1, els.findIndex((e) => e.offsetTop !== top) === -1 ? els.length : els.findIndex((e) => e.offsetTop !== top));
  };

  const onKey = (e: KeyboardEvent) => {
    if (renaming) return;
    const order = children.map((c) => c.id);
    const at = focusId ? order.indexOf(focusId) : -1;
    const cols = columns();
    const step: Record<string, number> = { ArrowRight: view === "grid" ? 1 : 0, ArrowLeft: view === "grid" ? -1 : 0, ArrowDown: cols, ArrowUp: -cols };
    if (e.key in step && step[e.key] !== 0) {
      e.preventDefault();
      const to = order[Math.max(0, Math.min(order.length - 1, at < 0 ? 0 : at + step[e.key]))];
      if (!to) return;
      if (e.shiftKey && anchor) {
        const [a, b] = [order.indexOf(anchor), order.indexOf(to)].sort((x, y) => x - y);
        setSel(new Set(order.slice(a, b + 1)));
      } else if (!e.metaKey && !e.ctrlKey) {
        setSel(new Set([to]));
        setAnchor(to);
      }
      focusItem(to);
    } else if (e.key === " " && focusId) {
      e.preventDefault();
      const next = new Set(sel);
      if (next.has(focusId)) next.delete(focusId);
      else next.add(focusId);
      setSel(next);
      setAnchor(focusId);
    } else if (e.key === "Enter" && focusId) {
      e.preventDefault();
      const n = byId.get(focusId);
      if (n) open(n);
    } else if (e.key === "F2" && focusId) {
      e.preventDefault();
      setRenaming(focusId);
    } else if ((e.key === "Delete" || (e.key === "Backspace" && (e.metaKey || e.ctrlKey))) && sel.size) {
      e.preventDefault();
      remove([...sel]);
    } else if (e.key === "Backspace" && cwd) {
      e.preventDefault();
      const back = cwd;
      goTo(byId.get(cwd)?.parent ?? null);
      requestAnimationFrame(() => focusItem(back));
    } else if (e.key.toLowerCase() === "a" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setSel(new Set(order));
    }
  };

  const onDragStart = (e: DragEvent, n: FMNode) => {
    const ids = sel.has(n.id) ? [...sel] : [n.id];
    if (!sel.has(n.id)) setSel(new Set([n.id]));
    dragIds.current = ids;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", ids.map((i) => byId.get(i)?.name).join("\n"));
  };
  const canDrop = (folder: string | null) => dragIds.current.length > 0 && dragIds.current.every((i) => i !== folder && !(folder && isInside(folder, i)));
  const dropProps = (folder: string | null, key: string) => ({
    onDragOver: (e: DragEvent) => {
      if (!canDrop(folder)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dropTarget !== key) setDropTarget(key);
    },
    onDragLeave: (e: DragEvent) => {
      if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) setDropTarget((t) => (t === key ? null : t));
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setDropTarget(null);
      move(dragIds.current, folder);
      dragIds.current = [];
    },
  });

  useEffect(() => {
    const end = () => {
      dragIds.current = [];
      setDropTarget(null);
    };
    window.addEventListener("dragend", end);
    return () => window.removeEventListener("dragend", end);
  }, []);

  const openMenu = (e: ReactMouseEvent, n: FMNode | null) => {
    e.preventDefault();
    e.stopPropagation();
    if (n && !sel.has(n.id)) {
      setSel(new Set([n.id]));
      setAnchor(n.id);
    }
    if (n) setFocusId(n.id);
    setMenu({ x: e.clientX, y: e.clientY, target: n?.id ?? null, n: (menu?.n ?? 0) + 1 });
  };
  const menuItems = (): MenuEntry[] => {
    if (!menu?.target) {
      return [
        { label: lm.newFolder, icon: <FolderPlus />, onSelect: newFolder },
        { label: lm.selectAll, shortcut: "Ctrl A", onSelect: () => setSel(new Set(children.map((c) => c.id))) },
      ];
    }
    const t = byId.get(menu.target)!;
    const many = sel.size > 1;
    const folders = nodes.filter((n) => n.kind === "folder" && !sel.has(n.id) && ![...sel].some((s) => isInside(n.id, s)));
    return [
      ...(!many ? [{ label: t.kind === "folder" ? lm.openFolder : lm.openFile, icon: t.kind === "folder" ? <FolderOpen /> : <FileText />, onSelect: () => open(t) } as MenuEntry] : []),
      ...(!many ? [{ label: lm.rename, icon: <Pencil />, shortcut: "F2", onSelect: () => setRenaming(t.id) } as MenuEntry] : []),
      {
        type: "submenu",
        label: many ? lm.moveManyTo(sel.size) : lm.moveTo,
        icon: <Folder />,
        items: [
          ...(cwd ? [{ label: rootName, onSelect: () => move([...sel], null) } as MenuEntry] : []),
          ...folders.filter((f) => f.id !== cwd).map((f) => ({ label: f.name, onSelect: () => move([...sel], f.id) }) as MenuEntry),
        ],
      },
      { type: "separator" },
      { label: many ? lm.deleteMany(sel.size) : lm.delete, icon: <Trash2 />, shortcut: "Del", danger: true, onSelect: () => remove([...sel]) },
    ];
  };
  const menuAnchor = useCallback(() => new DOMRect(menu?.x ?? 0, menu?.y ?? 0, 0, 0), [menu]);

  // A render function, not a component: a component declared here would remount every tile on each render.
  const tile = (n: FMNode) => {
    const Icon = iconFor(n, dropTarget === n.id);
    const on = sel.has(n.id);
    const target = dropTarget === n.id;
    return (
      <motion.div
        key={n.id}
        layout="position"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.14, ease: easeOut } }}
        transition={{ layout: springSoft, opacity: fade }}
        data-node={n.id}
        role="option"
        aria-selected={on}
        tabIndex={focusId === n.id || (!focusId && children[0]?.id === n.id) ? 0 : -1}
        draggable={renaming !== n.id}
        onDragStart={(e) => onDragStart(e as unknown as DragEvent, n)}
        {...(n.kind === "folder" ? dropProps(n.id, n.id) : {})}
        onClick={(e) => clickItem(e, n)}
        onDoubleClick={() => open(n)}
        onContextMenu={(e) => openMenu(e, n)}
        onFocus={() => setFocusId(n.id)}
        className={cn(
          "relative cursor-default select-none rounded-card outline-offset-[-2px]",
          view === "grid" ? "flex flex-col items-center gap-2 px-2 pb-3 pt-4 text-center" : "grid grid-cols-[minmax(0,1fr)_6rem] items-center gap-3 px-3 py-2 @xl:grid-cols-[minmax(0,1fr)_7rem_6rem]",
        )}
      >
        <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 rounded-card bg-accent-soft" />
        <motion.span aria-hidden initial={false} animate={{ opacity: target ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 rounded-card ring-2 ring-inset ring-accent" />
        <span className={cn("relative z-[1] flex min-w-0 items-center", view === "grid" ? "flex-col gap-2" : "gap-3")}>
          <Icon className={cn("shrink-0", view === "grid" ? "size-10" : "size-5", n.kind === "folder" ? "text-accent" : "text-muted")} strokeWidth={view === "grid" ? 1.4 : 1.8} />
          {renaming === n.id ? (
            <RenameInput label={l.newName} name={n.name} kind={n.kind} align={view === "grid" ? "center" : "left"} onDone={(v) => (v == null ? (setRenaming(null), focusItem(n.id)) : commitRename(n.id, v))} />
          ) : (
            <span className={cn("min-w-0 text-[13px] text-ink", view === "grid" ? "line-clamp-2 break-words" : "truncate")}>{n.name}</span>
          )}
        </span>
        {view === "list" && (
          <>
            <span className="relative z-[1] hidden truncate text-[13px] text-muted @xl:block">{n.modified ?? l.none}</span>
            <span className="relative z-[1] text-right text-[13px] text-muted tabular">{n.kind === "folder" ? l.items(nodes.filter((c) => c.parent === n.id).length) : l.fileSize(n.size)}</span>
          </>
        )}
      </motion.div>
    );
  };

  return (
    <div className={cn("@container flex w-full flex-col overflow-hidden rounded-sheet bg-surface", className)}>
      <div className="flex flex-wrap items-center gap-2 px-3 pb-2 pt-3">
        <nav aria-label={l.folderPath} className="flex min-w-0 flex-1 items-center gap-0.5 text-sm">
          {[{ id: null as string | null, name: rootName }, ...path].map((p, i, arr) => {
            const last = i === arr.length - 1;
            const key = `crumb-${p.id ?? "root"}`;
            return (
              <span key={key} className={cn("flex items-center gap-0.5", last ? "min-w-0" : "shrink-0")}>
                {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-faint" aria-hidden />}
                <button
                  type="button"
                  aria-current={last ? "location" : undefined}
                  onClick={() => goTo(p.id)}
                  {...dropProps(p.id, key)}
                  className={cn(
                    "relative truncate rounded-[6px] px-2 py-1 transition-colors",
                    last ? "font-medium text-ink" : "text-muted hover:bg-raised hover:text-ink",
                    dropTarget === key && "bg-accent-soft text-ink",
                  )}
                >
                  {p.name}
                </button>
              </span>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={newFolder}
            className="inline-flex h-8 items-center gap-1.5 rounded-control bg-btn-secondary px-3 text-[13px] font-medium text-btn-secondary-ink transition-colors hover:bg-btn-secondary-hover"
          >
            <FolderPlus className="size-4" /> <span className="hidden @md:inline">{l.newFolder}</span>
          </button>
          <SegmentedControl
            size="sm"
            label={l.view}
            value={view}
            onChange={setView}
            options={[
              { value: "grid", label: <span className="sr-only">{l.grid}</span>, icon: <LayoutGrid className="size-4" /> },
              { value: "list", label: <span className="sr-only">{l.list}</span>, icon: <List className="size-4" /> },
            ]}
          />
        </div>
      </div>

      {view === "list" && (
        <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3 px-6 pb-1 text-xs text-muted @xl:grid-cols-[minmax(0,1fr)_7rem_6rem]">
          <span>{l.name}</span>
          <span className="hidden @xl:block">{l.modified}</span>
          <span className="text-right">{l.size}</span>
        </div>
      )}

      <div
        ref={areaRef}
        role="listbox"
        aria-multiselectable
        aria-label={l.listLabel(path.at(-1)?.name ?? rootName, children.length)}
        tabIndex={children.length ? -1 : 0}
        onKeyDown={onKey}
        onClick={() => !renaming && setSel(new Set())}
        onContextMenu={(e) => openMenu(e, null)}
        {...dropProps(cwd, `here-${cwd ?? "root"}`)}
        className="relative min-h-72 flex-1 overflow-y-auto bg-raised/50 p-2 outline-none"
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`${cwd ?? "root"}-${view}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.18 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className={cn(view === "grid" ? "grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-1" : "flex flex-col gap-0.5")}
          >
            <AnimatePresence initial={false}>
              {children.map(tile)}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
        {children.length === 0 && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div>
              <Folder className="mx-auto size-10 text-faint" strokeWidth={1.3} />
              <p className="mt-3 text-sm font-medium text-ink">{l.emptyTitle}</p>
              <p className="mt-1 text-[13px] text-muted">{l.emptyHint}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-2 text-xs text-muted">
        <span className="tabular">{sel.size ? l.selectedOf(sel.size, children.length) : l.itemCount(children.length)}</span>
        <span className="hidden @lg:inline">{l.hint(navigator.platform.includes("Mac") ? "⌘" : "Ctrl")}</span>
      </div>
      <span className="sr-only" aria-live="polite" id={`${id}-live`}>{said}</span>

      {menu && (
        <MenuContent
          key={menu.n}
          open
          anchor={menuAnchor}
          items={menuItems()}
          label={l.fileActions}
          onClose={() => setMenu(null)}
          restoreFocus={false}
        />
      )}
    </div>
  );
}

function RenameInput({ label, name, kind, align, onDone }: { label: string; name: string; kind: FMNode["kind"]; align: "center" | "left"; onDone: (v: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [v, setV] = useState(name);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const dot = kind === "file" ? name.lastIndexOf(".") : -1;
    el.setSelectionRange(0, dot > 0 ? dot : name.length);
  }, [name, kind]);
  const finish = (val: string | null) => {
    if (done.current) return;
    done.current = true;
    onDone(val);
  };
  return (
    <input
      ref={ref}
      aria-label={label}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") finish(v);
        if (e.key === "Escape") finish(null);
      }}
      onBlur={() => finish(v)}
      className={cn("w-full min-w-0 rounded-[5px] border border-accent bg-surface px-1.5 py-0.5 text-[13px] text-ink outline-none ring-2 ring-accent/25", align === "center" ? "text-center" : "text-left")}
    />
  );
}
