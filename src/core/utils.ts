import { isRef, toRaw } from "vue";

const isFunction = (val: any) => typeof val === 'function';
const isString = (val: any) => typeof val === 'string';

const classifyRE = /(?:^|[-_])(\w)/g;
const classify = (str: string) => str.replace(classifyRE, (c: string) => c.toUpperCase()).replace(/[-_]/g, '');

function getComponentName(Component: { displayName: any; name: any; __name: any; }, includeInferred = true) {
  return isFunction(Component)
    ? Component.displayName || Component.name
    : Component.name || (includeInferred && Component.__name);
}

function formatComponentName(instance: any, Component: any, isRoot = false) {
  let name = getComponentName(Component);
  if (!name && Component.__file) {
    const match = Component.__file.match(/([^/\\]+)\.\w+$/);
    if (match) {
      name = match[1];
    }
  }
  if (!name && instance && instance.parent) {
    // try to infer the name based on reverse resolution
    const inferFromRegistry = (registry: { [x: string]: any; }) => {
      for (const key in registry) {
        if (registry[key] === Component) {
          return key;
        }
      }
    };
    name =
      inferFromRegistry(instance.components ||
        instance.parent.type.components) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}

function formatTraceEntry({ vnode, recurseCount }: any) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const isRoot = vnode.component ? vnode.component.parent == null : false;
  const open = ` at <${formatComponentName(vnode.component, vnode.type, isRoot)}`;
  const close = `>` + postfix;
  // *add the path to the warn log
  const path = ` _path=${vnode.type.__file} `
  return vnode.props
    ? [open, ...formatProps(vnode.props), path, close]
    : [open + path + close];
}

function formatProps(props: { [x: string]: any; }) {
  const res = [];
  const keys = Object.keys(props);
  keys.slice(0, 3).forEach(key => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys.length > 3) {
    res.push(` ...`);
  }
  return res;
}

function formatProp(key: string, value: any, raw?: any) {
  if (isString(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  }
  else if (typeof value === 'number' ||
    typeof value === 'boolean' ||
    value == null) {
    return raw ? value : [`${key}=${value}`];
  }
  else if (isRef(value)) {
    value = formatProp(key, toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  }
  else if (isFunction(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  }
  else {
    value = toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}

/* istanbul ignore next */
export function formatTrace(trace: any[]) {
  const logs: string[] = [];
  trace.forEach((entry: any, i: number) => {
    logs.push(...(i === 0 ? [] : [`\n`]), ...formatTraceEntry(entry));
  });
  return logs;
}
