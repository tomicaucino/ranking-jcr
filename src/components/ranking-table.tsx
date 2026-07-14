import { Badge } from "@/components/ui/badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import type { Standing } from "@/lib/types";

export function RankingTable({ standings }: { standings: Standing[] }) {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>#</Th>
          <Th>Jugador</Th>
          <Th className="text-center">Puntos</Th>
          <Th className="text-center">PJ</Th>
          <Th className="text-center">PG</Th>
          <Th className="text-center">PE</Th>
          <Th className="text-center">PP</Th>
          <Th className="text-center" title="Hoyos a favor">
            H+
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {standings.map((s, i) => (
          <Tr key={s.player.id}>
            <Td className="font-semibold text-primary-700">{i + 1}</Td>
            <Td>
              <span className="font-medium">{s.player.name}</span>
              {!s.player.active && (
                <Badge tone="gray" className="ml-2">
                  Inactivo
                </Badge>
              )}
            </Td>
            <Td className="text-center">
              <Badge tone={i === 0 ? "gold" : "green"} className="text-sm font-semibold">
                {s.points}
              </Badge>
            </Td>
            <Td className="text-center">{s.played}</Td>
            <Td className="text-center">{s.won}</Td>
            <Td className="text-center">{s.drawn}</Td>
            <Td className="text-center">{s.lost}</Td>
            <Td className="text-center">{s.holesFor}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
