const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const customers = require("../database/customer");
const protocol = require("../database/protocol");
const insurances = require("../database/insurance");
const company = require("../database/company");
const exemptions = require("../database/exemption");
const payments = require("../database/payment");
const users = require("../database/user");
const bank = require("../database/bankAccount");
const services = require("../database/service");
const invoices = require("../database/invoice");
const invoicesItem = require("../database/invoice-item");
async function createManyProtocolsAndInsuranceAndCompanyAndExemption() {
  await prisma.protocol.createMany({
    data: protocol.map(({ createdAt, updatedAt, ...rest }) => ({
      createdAt: createdAt + "Z",
      updatedAt: updatedAt + "Z",
      ...rest,
    })),
  });
  await prisma.insurance.createMany({
    data: insurances.map(({ createdAt, updatedAt, deletedAt, ...rest }) => ({
      createdAt: createdAt + "Z",
      updatedAt: updatedAt + "Z",
      deletedAt: deletedAt && deletedAt + "Z",
      ...rest,
    })),
  });
  await prisma.company.createMany({
    data: company.map(({ createdAt, updatedAt, deletedAt, ...rest }) => ({
      createdAt: createdAt + "Z",
      updatedAt: updatedAt + "Z",
      deletedAt: deletedAt && deletedAt + "Z",
      ...rest,
    })),
  });
  await prisma.exemption.createMany({
    data: exemptions.map(({ createdAt, updatedAt, deletedAt, ...rest }) => ({
      createdAt: createdAt + "Z",
      updatedAt: updatedAt + "Z",
      deletedAt: deletedAt && deletedAt + "Z",
      ...rest,
    })),
  });
  await prisma.bankAccount.createMany({
    data: bank.map(({ createdAt, updatedAt, deletedAt, ...rest }) => ({
      ...rest,
    })),
  });
  await prisma.payment.createMany({
    data: payments.map(({ createdAt, updatedAt, deletedAt, ...rest }) => ({
      createdAt: createdAt + "Z",
      updatedAt: updatedAt + "Z",
      deletedAt: deletedAt && deletedAt + "Z",
      ...rest,
    })),
  });
  await prisma.user.createMany({
    data: users.map(({ createdAt, updatedAt, deletedAt, ...rest }) => ({
      createdAt: createdAt + "Z",
      updatedAt: updatedAt + "Z",
      deletedAt: deletedAt && deletedAt + "Z",
      ...rest,
    })),
  });
}
async function createServices() {
  await prisma.service.createMany({
    data: [
      {
        name: "Observação Beta (2h)",
        discount: 0,
        type: "SERVICE",
        unit_price: 20000,
        categoryId: "a8216b2a-fa0f-4d18-92d9-9e9c315b752f",
      },
      {
        name: "Observação Gama",
        discount: 0,
        type: "SERVICE",
        unit_price: 25000,
        categoryId: "a8216b2a-fa0f-4d18-92d9-9e9c315b752f",
      },

      // BIOQUIMICA

      {
        name: "Internamento Alfa (6h)",
        discount: 0,
        type: "SERVICE",
        unit_price: 50000,
        categoryId: "c67026c0-da8d-4e02-8513-4885c330a92a",
      },
      {
        name: "Internamento Beta (12h)",
        discount: 0,
        type: "SERVICE",
        unit_price: 75000,
        categoryId: "c67026c0-da8d-4e02-8513-4885c330a92a",
      },
      {
        name: "Internamento Gama (24h)",
        discount: 0,
        type: "SERVICE",
        unit_price: 100000,
        categoryId: "c67026c0-da8d-4e02-8513-4885c330a92a",
      },
    ],
  });
}
async function main() {
  await createServices();
  // await createManyProtocolsAndInsuranceAndCompanyAndExemption();
  // await createCustomers();
  // await createCategory();
  // await createInvoice();
  // await createInvoicesItem();
}
async function createCustomers() {
  for await (const customer of customers) {
    const {
      insuranceId,
      insurance_number,
      protocolId,
      createdAt,
      updatedAt,
      deletedAt,
      ...rest
    } = customer;
    await prisma.customer.create({
      data: {
        createdAt: createdAt + "Z",
        updatedAt: updatedAt + "Z",
        deletedAt: deletedAt && deletedAt + "Z",
        ...rest,
      },
    });

    if (insuranceId && insurance_number) {
      await prisma.customerInsurance.create({
        data: {
          customerId: customer.id,
          insuranceId,
          insuranceNumber: insurance_number,
          createdAt: createdAt + "Z",
          updatedAt: updatedAt + "Z",
          deletedAt: deletedAt && deletedAt + "Z",
        },
      });
    }
  }
}

async function createCategory() {
  const categories = [
    {
      desc: "Laboratório",
      sigla: "LAB",
      subcategory: "Hematologia",
    },
    {
      desc: "Enfermaria",
      sigla: "ENF",
      subcategory: "Consulta",
    },
    {
      desc: "Estomatologia",
      sigla: "EST",
      subcategory: "Consulta",
    },
    {
      desc: "Radiologia",
      sigla: "RX",
      subcategory: "Exames radiológicos",
    },
    {
      desc: "Ecografia e especialidade",
      sigla: "ECO ESP",
      subcategory: "Ecografia",
    },
  ];
  for await (const category of categories) {
    await prisma.category.create({
      data: {
        name: category.desc,
        subCategories: {
          create: {
            name: category.subcategory,
            // Service: {
            //   createMany: {
            //     data: services
            //       .filter((item) => category.sigla.includes(item.category))
            //       .map(
            //         ({
            //           createdAt,
            //           updatedAt,
            //           deletedAt,
            //           category,
            //           isInput,
            //           ...rest
            //         }) => ({
            //           createdAt: createdAt + "Z",
            //           updatedAt: updatedAt + "Z",
            //           deletedAt: deletedAt && deletedAt + "Z",
            //           ...rest,
            //         })
            //       ),
            //   },
            // },
          },
        },
      },
    });
  }
}

async function createInvoice() {
  for await (const invoice of invoices) {
    const {
      customerId,
      createdAt,
      updatedAt,
      deletedAt,
      emission_date,
      ...rest
    } = invoice;
    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
      include: {
        customersInsurance: {
          include: {
            insurance: true,
          },
        },
      },
    });
    await prisma.invoice.create({
      data: {
        customerId,
        insuranceId: customer.customersInsurance[0]?.insurance?.id,
        createdAt: createdAt + "Z",
        updatedAt: updatedAt + "Z",
        deletedAt: deletedAt && deletedAt + "Z",
        emission_date: emission_date + "Z",
        ...rest,
      },
    });
  }
}
async function createInvoicesItem() {
  for await (const item of invoicesItem) {
    const result = await prisma.service.findUnique({
      where: {
        id: item.serviceId,
      },
    });

    if (!result) {
      console.log(item.serviceId);
    } else {
      console.log("EXISTE", item.serviceId);
      const { createdAt, updatedAt, ...rest } = item;
      await prisma.invoiceItem.create({
        data: {
          ...rest,
        },
      });
    }
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
