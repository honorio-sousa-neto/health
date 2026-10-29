import { Notify } from "quasar";
export function useNotify() {
  function notify(status, message, position) {
    try {
      Notify.create({ message, color: status ? "green" : "red", position });
    } catch (error) {
      console.log(error.message);
    }
  }

  return {
    notify,
  };
}
