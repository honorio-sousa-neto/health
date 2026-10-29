import { SessionStorage } from "quasar";
let user = null;

const getUser = () => {
  const user = SessionStorage.getItem("alfavida_user");
};

export { user, getUser };
