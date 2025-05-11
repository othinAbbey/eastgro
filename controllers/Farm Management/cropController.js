import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a full crop entry
// const createCrop = async (req, res) => {
//   try {
//     const { name, description, agronomy, inputs, pests, diseases } = req.body;
//     //check if name exist
//     const existingCrop = await prisma.crop.findUnique({
//       where: { name },
//     });
//     if (existingCrop) {
//       res.status(400).json({ message: "Crop already exists" });
//       return;
//     }
//     const crop = await prisma.crop.create({
//       data: {
//         name,
//         description,
//         agronomy: {
//           create: agronomy.map((content) => ({ content })),
//         },
//         inputs: {
//           create: inputs.map((input) => ({
//             name: input.name,
//             type: input.type,
//             description: input.description,
//           })),
//         },
//         pests: {
//           create: pests.map((pest) => ({
//             name: pest.name,
//             description: pest.description,
//             control: pest.control,
//           })),
//         },
//         diseases: {
//           create: diseases.map((disease) => ({
//             name: disease.name,
//             description: disease.description,
//             treatment: disease.treatment,
//           })),
//         },
//       },
//       include: {
//         agronomy: true,
//         inputs: true,
//         pests: true,
//         diseases: true,
//       },
//     });

//     res.status(201).json(crop);
//   } catch (error) {
//     console.error("Error creating crop:", error);
//     res
//       .status(500)
//       .json({ message: "Something went wrong", error: error.message });
//   }
// };
// const createCrop = async (req, res) => {
//     try {
//       const { name, description, agronomy, inputs, pests, diseases, cropVariety } = req.body;
  
//       // Check if crop already exists
//       const existingCrop = await prisma.crop.findUnique({
//         where: { name },
//       });
  
//       if (existingCrop) {
//         return res.status(400).json({ message: "Crop already exists" });
//       }
  
//       const crop = await prisma.crop.create({
//         data: {
//           name,
//           description,
//           agronomy: {
//             create: agronomy?.map((content) => ({ content })) || [],
//           },
//           inputs: {
//             create: inputs?.map((input) => ({
//               name: input.name,
//               type: input.type,
//               description: input.description,
//             })) || [],
//           },
//           pests: {
//             create: pests?.map((pest) => ({
//               name: pest.name,
//               description: pest.description,
//               control: pest.control,
//             })) || [],
//           },
//           diseases: {
//             create: diseases?.map((disease) => ({
//               name: disease.name,
//               description: disease.description,
//               treatment: disease.treatment,
//             })) || [],
//           },
//           varieties: {
//             create: cropVariety?.map((variety) => ({
//               name: variety.name,
//               description: variety.description,
//               daysToMaturity: variety.daysToMaturity,
//               yieldPotential: variety.yieldPotential,
//             })) || [],
//           },
//         },
//         include: {
//           agronomy: true,
//           inputs: true,
//           pests: true,
//           diseases: true,
//           varieties: true,
//         },
//       });
  
//       res.status(201).json(crop);
//     } catch (error) {
//       console.error("Error creating crop:", error);
//       res.status(500).json({
//         message: "Something went wrong",
//         error: error.message,
//       });
//     }
//   };
const createCrop = async (req, res) => {
    try {
      const { name, description, agronomy, inputs, pests, diseases, CropVariety , yieldPotential,kgPerAcre,yieldPerAcre} = req.body;
  
      const existingCrop = await prisma.crop.findUnique({
        where: { name },
      });
  
      if (existingCrop) {
        return res.status(400).json({ message: "Crop already exists" });
      }
  
      const crop = await prisma.crop.create({
        data: {
          name,
          description,
          agronomy: {
            create: agronomy.map((content) => ({ content })),
          },
          inputs: {
            create: inputs.map((input) => ({
              name: input.name,
              type: input.type,
              description: input.description,
            })),
          },
          pests: {
            create: pests.map((pest) => ({
              name: pest.name,
              description: pest.description,
              control: pest.control,
            })),
          },
          diseases: {
            create: diseases.map((disease) => ({
              name: disease.name,
              description: disease.description,
              treatment: disease.treatment,
            })),
          },
          CropVariety: {
            create: CropVariety.map((variety) => ({
              name: variety.name,
              description: variety.description,
              daysToMaturity: variety.daysToMaturity,
              yieldPotential: variety.yieldPotential,
              kgPerAcre: variety.kgPerAcre,
              yieldPerAcre: variety.yieldPerAcre,
            })),
          },
        },
        include: {
          agronomy: true,
          inputs: true,
          pests: true,
          diseases: true,
          CropVariety: true,
        },
      });
  
      res.status(201).json(crop);
    } catch (error) {
      console.error("Error creating crop:", error);
      res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  };
   

// Get all crops (list only basic info)
const getAllCrops = async (req, res) => {
  try {
    const crops = await prisma.crop.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    res.json(crops);
  } catch (error) {
    console.error("Error fetching crops:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Get one crop with full nested data
const getCropById = async (req, res) => {
  try {
    const { id } = req.params;

    const crop = await prisma.crop.findUnique({
      where: { id },
      include: {
        agronomy: true,
        inputs: true,
        pests: true,
        diseases: true,
      },
    });

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    res.json(crop);
  } catch (error) {
    console.error("Error fetching crop:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Update a crop (basic fields only, for now)
const updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedCrop = await prisma.crop.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    res.json(updatedCrop);
  } catch (error) {
    console.error("Error updating crop:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Delete a crop (and cascade delete related stuff)
const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.crop.delete({
      where: { id },
    });

    res.json({ message: "Crop deleted successfully" });
  } catch (error) {
    console.error("Error deleting crop:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

const getVarietyAttributes = async (req, res) => {
  try {
    const { varietyId } = req.params;
    const variety = await prisma.cropVariety.findUnique({
      where: { id: varietyId },
      include: { attributes: true },
    });
    res.json(variety);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch variety attributes", error: err });
  }
};

export {
  createCrop,
  getAllCrops,
  getCropById,
  updateCrop,
  deleteCrop,
  getVarietyAttributes,
};
