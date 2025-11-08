import { useEffect, useState } from "react";
import { api } from "../../types/api";
import CardParente from "../../components/CardParente";
import Carregamento from "../../components/Carregamento";

export default function Dependentes() {
  const [dependentes, setDependentes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);


  const [form, setForm] = useState({
    nome: "",
    dsParentesco: "",
    nmrTelefone: "",
    codigoPaciente: 1,
  });


  const [editando, setEditando] = useState<any | null>(null);


  function extrairId(dep: any) {
    return (
      dep.id ??
      dep.codigo ??
      dep.idParente ??
      dep.codigoParente ??
      dep.cdParente ??
      null
    );
  }


  async function carregarDependentes() {
    setCarregando(true);
    try {
      const dados = await api.getDependentes();

      // Normaliza retorno
      const lista = Array.isArray(dados)
        ? dados
        : Array.isArray(dados.content)
        ? dados.content
        : [];

      setDependentes(lista);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDependentes();
  }, []);

  function iniciarEdicao(dep: any) {
    setEditando(dep);
    setForm({
      nome: dep.nome,
      dsParentesco: dep.dsParentesco,
      nmrTelefone: dep.nmrTelefone,
      codigoPaciente: dep.codigoPaciente,
    });
  }


  async function salvarEdicao(e: any) {
    e.preventDefault();
    if (!editando) return;

    const id = extrairId(editando);
    await api.updateDependente(id, form);

    setEditando(null);
    carregarDependentes();
  }

  async function criarDependente(e: any) {
    e.preventDefault();

    if (
      !form.nome ||
      !form.dsParentesco ||
      !form.nmrTelefone ||
      !form.codigoPaciente
    )
      return;

    await api.createDependente(form);

    setForm({
      nome: "",
      dsParentesco: "",
      nmrTelefone: "",
      codigoPaciente: form.codigoPaciente,
    });

    carregarDependentes();
  }

  async function excluirDependente(dep: any) {
    const id = extrairId(dep);
    await api.deleteDependente(id);
    carregarDependentes();
  }

  if (carregando) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Carregamento />
      </div>
    );
  }

  return (
    <main className="lembretes_container">

      <section className="lembretes_cabecalho">
        <h2 className="lembretes_titulo">Parentes</h2>
        <p className="lembretes_subtitulo">
          Cadastre, edite e visualize os parentes vinculados a um paciente
        </p>
      </section>

      <section>
        <form
          className="cartao_autenticacao"
          onSubmit={editando ? salvarEdicao : criarDependente}
        >
          <div className="campo_formulario">
            <label>Nome:</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>

          <div className="campo_formulario">
            <label>Parentesco:</label>
            <input
              type="text"
              value={form.dsParentesco}
              onChange={(e) =>
                setForm({ ...form, dsParentesco: e.target.value })
              }
            />
          </div>

          <div className="campo_formulario">
            <label>Telefone:</label>
            <input
              type="text"
              value={form.nmrTelefone}
              onChange={(e) =>
                setForm({ ...form, nmrTelefone: e.target.value })
              }
            />
          </div>

          <div className="campo_formulario">
            <label>ID Paciente:</label>
            <input
              type="number"
              value={form.codigoPaciente}
              onChange={(e) =>
                setForm({
                  ...form,
                  codigoPaciente: Number(e.target.value),
                })
              }
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--azul-principal)] text-white p-3 rounded-lg font-semibold mt-4"
          >
            {editando ? "Salvar Alterações" : "Criar Parente"}
          </button>

          {editando && (
            <button
              type="button"
              className="w-full botao-outline mt-2 p-3 rounded-lg font-semibold"
              onClick={() => setEditando(null)}
            >
              Cancelar
            </button>
          )}
        </form>
      </section>

      <section className="container_consultas mt-10">
        {dependentes.length > 0 ? (
          dependentes.map((d) => {
            const id = extrairId(d);
            return (
              <CardParente
                key={id}
                id={id}
                nome={d.nome}
                parentesco={d.dsParentesco}
                telefone={d.nmrTelefone}
                codigoPaciente={d.codigoPaciente}
                onEditar={() => iniciarEdicao(d)}
                onExcluir={() => excluirDependente(d)}
              />
            );
          })
        ) : (
          <p>Nenhum parente cadastrado ainda.</p>
        )}
      </section>

    </main>
  );
}
