-- CreateTable
CREATE TABLE "_GrupoLideres" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GrupoLideres_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GrupoLideres_B_index" ON "_GrupoLideres"("B");

-- AddForeignKey
ALTER TABLE "_GrupoLideres" ADD CONSTRAINT "_GrupoLideres_A_fkey" FOREIGN KEY ("A") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GrupoLideres" ADD CONSTRAINT "_GrupoLideres_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
