import { z } from "zod";

/**
 * Fornecedores.
 *
 * `address`, `phone` e `email` são opcionais na base e eram obrigatórios
 * aqui. Um fornecedor sem morada era recusado — e a recusa nem chegava a
 * ser dita: o `parse` lançava dentro de um handler sem try/catch e o Express
 * 4 não apanha rejeições de handlers assíncronos, portanto o pedido ficava
 * pendurado até ao timeout do cliente.
 */
export const createSupplier = z.object({
  name: z.string().trim().min(1, "Indique o nome do fornecedor"),
  nif: z.string().trim().min(1, "Indique o NIF do fornecedor"),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
});

export type TCreateSupplier = z.infer<typeof createSupplier>;

export const updateSupplier = createSupplier.partial();

export type TUpdateSupplier = z.infer<typeof updateSupplier>;
