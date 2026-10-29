import { useExamsStore } from "src/stores/exams"
import { onMounted, ref } from "vue"

export const useArea = () => {
  const options = ref([])
  const store = useExamsStore()

  const fetchData = async () => {
     const  { data } = await store.index()
     options.value = data
  }

  onMounted(() => {
    fetchData()
  })
  return {
    options,
  }
}
