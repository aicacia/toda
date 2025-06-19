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
  splitAt: number;
  width: number;
  height: number;
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

let currentLayoutName = $state<string>("default");

const defaultPaneId = createUniqueId("pane");
const defaultPane: LayoutExtensionPane = { id: defaultPaneId, type: "extension-pane" };
const layoutsByName = $state<Layouts>({
  default: {
    id: defaultPaneId, name: "default", panes: { [defaultPaneId]: defaultPane }
  }
});

const currentLayout = $derived(layoutsByName[currentLayoutName]);

export const layouts = {
  get byName() {
    return layoutsByName;
  },
  get currentName() {
    return currentLayoutName;
  },
  get current() {
    return currentLayout;
  }
};

export function joinCurrentLayout(id: string, side: Side = "first") {
  return updateCurrentLayout(layout => {
    const pane = layout.panes[id];
    if (pane?.type === "split-pane") {
      const newPaneId = side === "second" ? pane.first : pane.second;
      if (side === "second") {
        delete layout.panes[pane.second];
      } else {
        delete layout.panes[pane.first];
      }

      for (const p of Object.values(layout.panes)) {
        if (p.type !== "split-pane") {
          continue;
        }
        if (p.first === id) {
          p.first = newPaneId;
        }
        if (p.second === id) {
          p.second === newPaneId;
        }
      }

      if (layout.id === id) {
        layout.id = newPaneId;
      }
      delete layout.panes[id];
    }
    return layout;
  });
}

export function splitCurrentLayout(id: string, x: number, y: number, width: number, height: number, direction: Direction, side: Side = "first") {
  return updateCurrentLayout(layout => {
    const pane = layout.panes[id];

    let first: string;
    let second: string;
    if (side === "first") {
      first = pane ? clonePane(layout, pane) : createEmptyPane(layout);
      second = createEmptyPane(layout)
    } else {
      first = createEmptyPane(layout);
      second = pane ? clonePane(layout, pane) : createEmptyPane(layout);
    }

    const newPane: LayoutSplitPane = {
      id,
      type: "split-pane",
      direction,
      first,
      second,
      splitAt: direction === "vertical" ? x : y,
      width,
      height
    };

    layout.panes[newPane.id] = newPane;

    return layout;
  });
}

export function updateExtension(id: string, extension?: string) {
  return updateCurrentLayout(layout => {
    const pane = layout.panes[id];
    if (pane?.type === "extension-pane") {
      if (extension) {
        pane.extension = extension;
      } else {
        pane.extension = undefined;
      }
    }
    return layout;
  });
}

export function updateSplitAt(id: string, splitAt: number) {
  return updateCurrentLayout(layout => {
    const pane = layout.panes[id];
    if (pane?.type === "split-pane") {
      pane.splitAt = splitAt;
    }
    return layout;
  });
}

export function updateSize(id: string, width: number, height: number) {
  return updateCurrentLayout(layout => {
    const pane = layout.panes[id];
    if (pane?.type === "split-pane") {
      pane.width = width;
      pane.height = height;
    }
    return layout;
  });
}

function updateCurrentLayout(updateFn: (layout: Layout) => Layout) {
  if (!currentLayoutName) {
    currentLayoutName = "default";
  }
  const layout = updateFn(layouts.current);
  layoutsByName[currentLayoutName] = layout;
  return layout;
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
  layoutsByName[name] = layout;
}
