import { Badge } from "@/components/ui/badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import type { Standing } from "@/lib/types";

/**
 * Un <table> real no soporta reordenar columnas por breakpoint con CSS
 * (`order` no aplica a table-cell), así que en mobile renderizamos una
 * tabla con "Puntos" como tercera columna, y en desktop otra con el orden
 * original. Los <td> compartidos evitan que la lógica de cada celda
 * (badges, etc.) se duplique con matices distintos entre ambas.
 */
export function RankingTable({ standings }: { standings: Standing[] }) {
  return (
    <>
      <div className="sm:hidden">
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
                <RankCell rank={i + 1} />
                <PlayerCell standing={s} />
                <PointsCell standing={s} isLeader={i === 0} />
                <StatCells standing={s} />
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>

      <div className="hidden sm:block">
        <Table>
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Jugador</Th>
              <Th className="text-center">PJ</Th>
              <Th className="text-center">PG</Th>
              <Th className="text-center">PE</Th>
              <Th className="text-center">PP</Th>
              <Th className="text-center" title="Hoyos a favor">
                H+
              </Th>
              <Th className="text-center">Puntos</Th>
            </Tr>
          </Thead>
          <Tbody>
            {standings.map((s, i) => (
              <Tr key={s.player.id}>
                <RankCell rank={i + 1} />
                <PlayerCell standing={s} />
                <StatCells standing={s} />
                <PointsCell standing={s} isLeader={i === 0} />
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </>
  );
}

function RankCell({ rank }: { rank: number }) {
  return <Td className="font-semibold text-primary-700">{rank}</Td>;
}

function PlayerCell({ standing }: { standing: Standing }) {
  return (
    <Td>
      <span className="font-medium">{standing.player.name}</span>
      {!standing.player.active && (
        <Badge tone="gray" className="ml-2">
          Inactivo
        </Badge>
      )}
    </Td>
  );
}

function PointsCell({ standing, isLeader }: { standing: Standing; isLeader: boolean }) {
  return (
    <Td className="text-center">
      <Badge tone={isLeader ? "gold" : "green"} className="text-sm font-semibold">
        {standing.points}
      </Badge>
    </Td>
  );
}

function StatCells({ standing }: { standing: Standing }) {
  return (
    <>
      <Td className="text-center">{standing.played}</Td>
      <Td className="text-center">{standing.won}</Td>
      <Td className="text-center">{standing.drawn}</Td>
      <Td className="text-center">{standing.lost}</Td>
      <Td className="text-center">{standing.holesFor}</Td>
    </>
  );
}
