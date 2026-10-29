import { api } from "src/boot/axios";

export function useFetch() {
  async function index(url, params) {
    try {
      const { data } = await api.get(url, params);
      return {
        status: data.status,
        data: data.data ? data.data : data,
        message: data.message,
      };
    } catch (error) {
      return {
        status: true,
        data: null,
        message: error.message,
      };
    }
  }
  async function store(url, payload) {
    try {
      const { data } = await api.post(url, payload);
      return {
        status: data.status,
        data: data.data,
        message: data.message,
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.response.data.message,
      };
    }
  }

  async function update(url, payload) {
    try {
      const { data } = await api.patch(url, payload);
      return {
        status: data.status,
        data: data.data,
        message: data.message,
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.message,
      };
    }
  }

  async function destroy(url, id) {
    try {
      const { data } = await api.delete(`${url}/${id}`);
      return {
        status: data.status,
        data: data.data,
        message: data.message,
      };
    } catch (error) {
      return {
        status: true,
        data: null,
        message: error.message,
      };
    }
  }
  async function show(url, id) {
    try {
      const { data } = await api.get(`${url}/${id}`);
      return {
        status: data.status,
        data: data.data,
        message: data.message,
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.message,
      };
    }
  }

  return {
    index,
    store,
    update,
    destroy,
    show,
  };
}
