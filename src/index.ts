import { ComponentPublicInstance } from "vue";
import { formatTrace } from "./core/utils";

export default {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  install: (app: any, _options: any) => {
    // inject a globally available $translate() method
    app.config.warnHandler = (
      msg: string,
      instance: ComponentPublicInstance | null,
      _traceMsg: string,
      trace: any[]
    ) => {
      // console.log(msg, instance, trace)
      const warnArgs = [`[Better Vue warn]: ${msg}`];
      /* istanbul ignore if */
      if (trace.length &&
          // avoid spamming console during tests
          !false) {
          warnArgs.push(`\n`, ...formatTrace(trace));
      }
      console.warn(...warnArgs);
    }
  }
}
