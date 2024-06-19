import { Injectable } from '@nestjs/common';
import { CreateMaterielDto } from './dto/create-materiel.dto';
import { UpdateMaterielDto } from './dto/update-materiel.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MaterielService {
  constructor(private prisma: PrismaService) { }


  create(createMaterielDto: CreateMaterielDto) {3
    const {dateAcquisition,...rest}= createMaterielDto;
    return this.prisma.materiel.create({
      data:{
        ...rest,
        dateAcquisition:dateAcquisition? new Date(dateAcquisition).toISOString(): undefined
      }
    });
  }

  
  
  findAll() {
    return this.prisma.materiel.findMany({
        include: {
            Affectation: true,
            Emprunt: true
        }
    }).then((materiels) => {
        return materiels.map((materiel) => {
            let statut = '';
            if (materiel.Affectation.length == 0  && materiel.Emprunt.length == 0) {
              statut = 'Disponible';
            }else if (materiel.Affectation.length > 0) {
                statut = 'Affecté';
            } else if (materiel.Emprunt.length > 0) {
                statut = 'Emprunté';
            }
            return {
                ...materiel,
                statut: statut
            };
        });
    });
}


  

  findOne(numeroSerie: string) {
    return this.prisma.materiel.findUnique({
      where: { numeroSerie },
    });
  }

  update(numeroSerie: string, updateMaterielDto: UpdateMaterielDto) {
    return this.prisma.materiel.update({
      where: { numeroSerie },
      data: updateMaterielDto,
    });
  }

  async remove(numeroSerie: string) {
    await this.prisma.affectation.deleteMany({
      where: { numeroSerie },
    });

    // Delete related records in the Emprunt table
    await this.prisma.emprunt.deleteMany({
      where: { numeroSerie },
    });

    // Proceed with the delete operation for the Materiel record
    return this.prisma.materiel.delete({
      where: { numeroSerie },
    });
  }
}
