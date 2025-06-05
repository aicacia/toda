import { createUniqueId } from "$lib/util";

export type Direction = 'vertical' | 'horizontal';
export type Side = 'first' | 'second';

export type LayoutExtensionPane = {
  id: string;
  type: "extension-pane",
  extension?: string;
};

export type LayoutSplitPane = {
  id: string;
  type: "split-pane",
  direction: Direction;
  value: number;
  first: string;
  second: string;
};

export type LayoutPane = LayoutExtensionPane | LayoutSplitPane;

export type Layout = {
  id: string;
  name: string;
  panes: { [id: string]: LayoutPane };
};

export type Layouts = { [name: string]: Layout };

export const layouts = $state<Layouts>({});

let currentLayoutName = $state<string | undefined>();

export function getOrCreateCurrentLayout() {
  if (!currentLayoutName) {
    currentLayoutName = "default";
  }
  let currentLayout = layouts[currentLayoutName];
  if (!currentLayout) {
    const id = createUniqueId("pane");
    const pane: LayoutExtensionPane = { id, type: "extension-pane" };
    currentLayout = {
      id, name: currentLayoutName, panes: { [id]: pane }
    };
    layouts[currentLayoutName] = currentLayout;
  }
  return currentLayout;
}

export function splitCurrentLayout(id: string, x: number, y: number, width: number, height: number, direction: Direction, side: Side = "first") {
  let layout = getOrCreateCurrentLayout();

  let pane = layout.panes[id];

  let first, second;
  if (side === "first") {
    first = pane ? clonePane(layout, pane) : createEmptyPane(layout);
    second = createEmptyPane(layout)
  } else {
    first = createEmptyPane(layout);
    second = pane ? clonePane(layout, pane) : createEmptyPane(layout);
  }

  let newPane: LayoutSplitPane = {
    id,
    type: "split-pane",
    direction,
    first,
    second,
    value: direction === "vertical" ? x : y
  };

  layout.panes[newPane.id] = newPane;

  return layout;
}
export function updateExtension(id: string, extension: string) {
  let layout = getOrCreateCurrentLayout();
  let pane = layout.panes[id];
  if (pane?.type === "extension-pane") {
    pane.extension = extension;
  }
}
export function updateValue(id: string, value: number) {
  let layout = getOrCreateCurrentLayout();
  let pane = layout.panes[id];
  if (pane?.type === "split-pane") {
    pane.value = value;
  }
}

function createEmptyPane(layout: Layout) {
  const id = createUniqueId('pane');
  const pane: LayoutExtensionPane = { id, type: "extension-pane" };
  layout.panes[id] = pane;
  return id;
}

function clonePane(layout: Layout, pane: LayoutPane) {
  const id = createUniqueId('pane');
  const newPane = { ...pane, id };
  layout.panes[id] = newPane;
  return id;
}

export async function registerLayout(name: string, layout: Layout) {
  layouts[name] = layout;
}
