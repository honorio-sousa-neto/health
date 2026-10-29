export const getDateDaysBefore = (days) => {
  const today = new Date();
  return new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
};
// Função para obter a data de hoje desde a meia-noite
export function getStartOfToday() {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0); // Define horas, minutos, segundos e milissegundos como zero
  return todayDate;
}
