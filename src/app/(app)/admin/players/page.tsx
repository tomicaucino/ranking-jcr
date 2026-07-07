import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Player } from "@/lib/types";

export default async function AdminPlayersPage() {
  const supabase = await createClient();
  const { data: players } = await supabase.from("players").select("*").order("name");

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Jugadores</CardTitle>
        <Link href="/admin/players/new" className="text-sm font-medium text-primary-600 underline">
          + Nuevo jugador
        </Link>
      </CardHeader>
      <CardContent>
        {(players ?? []).length === 0 ? (
          <p className="text-muted">Todavía no hay jugadores cargados.</p>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Nombre</Th>
                <Th>Email</Th>
                <Th>Estado</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {(players as Player[]).map((player) => (
                <Tr key={player.id}>
                  <Td className="font-medium">{player.name}</Td>
                  <Td className="text-muted">{player.email}</Td>
                  <Td>
                    <Badge tone={player.active ? "green" : "gray"}>
                      {player.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/players/${player.id}/edit`}
                      className="text-sm font-medium text-primary-600 underline"
                    >
                      Editar
                    </Link>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
