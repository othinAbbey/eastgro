-- CreateTable
CREATE TABLE "_ProduceFacilities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProduceFacilities_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProduceFacilities_B_index" ON "_ProduceFacilities"("B");

-- AddForeignKey
ALTER TABLE "_ProduceFacilities" ADD CONSTRAINT "_ProduceFacilities_A_fkey" FOREIGN KEY ("A") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProduceFacilities" ADD CONSTRAINT "_ProduceFacilities_B_fkey" FOREIGN KEY ("B") REFERENCES "Produce"("id") ON DELETE CASCADE ON UPDATE CASCADE;
