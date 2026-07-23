"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useFilterStore } from "@/store/useFilterStore";
import { format, parseISO, isValid } from "date-fns";

export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const periodo = useFilterStore((state) => state.periodo);
  const filial = useFilterStore((state) => state.filial);
  const setPeriodo = useFilterStore((state) => state.setPeriodo);
  const setFilial = useFilterStore((state) => state.setFilial);

  const isInitialMount = useRef(true);

  // 1) Ler parâmetros da URL na primeira renderização
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const branchParam = searchParams.get("branch");

    let updatedPeriodo = false;
    let newFrom = periodo.from;
    let newTo = periodo.to;

    if (fromParam) {
      const parsedFrom = parseISO(fromParam);
      if (isValid(parsedFrom)) {
        newFrom = parsedFrom;
        updatedPeriodo = true;
      }
    }

    if (toParam) {
      const parsedTo = parseISO(toParam);
      if (isValid(parsedTo)) {
        newTo = parsedTo;
        updatedPeriodo = true;
      }
    }

    if (updatedPeriodo) {
      setPeriodo({ from: newFrom, to: newTo });
    }

    if (branchParam && branchParam !== filial) {
      setFilial(branchParam);
    }
  }, [searchParams, periodo.from, periodo.to, filial, setPeriodo, setFilial]);

  // 2) Sincronizar alterações da Store para a URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (periodo.from) {
      params.set("from", format(periodo.from, "yyyy-MM-dd"));
    }
    if (periodo.to) {
      params.set("to", format(periodo.to, "yyyy-MM-dd"));
    }
    if (filial) {
      params.set("branch", filial);
    }

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (newQuery !== currentQuery) {
      router.replace(`${pathname}?${newQuery}`, { scroll: false });
    }
  }, [periodo, filial, pathname, router, searchParams]);
}
