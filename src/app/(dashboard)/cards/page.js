"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import CardVisual from "@/components/dashboard/CardVisual";
import CardRequestModal from "@/components/dashboard/CardRequestModal";
import Button from "@/components/ui/Button";

export default function CardsPage() {
  const [cards, setCards] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function fetchData() {
    const [cardsRes, accountsRes] = await Promise.all([
      fetch("/api/cards"),
      fetch("/api/accounts"),
    ]);
    const cardsData = await cardsRes.json();
    const accountsData = await accountsRes.json();
    setCards(cardsData.cards || []);
    setAccounts(accountsData.accounts || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleToggleFreeze(card) {
    const newStatus = card.status === "frozen" ? "active" : "frozen";
    const res = await fetch(`/api/cards/${card._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const data = await res.json();
      setCards((prev) => prev.map((c) => (c._id === card._id ? data.card : c)));
    }
  }

  function handleDeleteCard(cardId) {
    setCards((prev) => prev.filter((c) => c._id !== cardId));
  }

  // Accounts that don't already have an active (non-cancelled) card
  const accountIdsWithCards = new Set(cards.map((c) => c.account?._id));
  const availableAccounts = accounts.filter((acc) => !accountIdsWithCards.has(acc._id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-muted animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Cards</h1>
          <p className="mt-1 text-sm text-muted">
            One card per account — manage your virtual and physical cards.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} disabled={availableAccounts.length === 0}>
          <Plus className="w-4 h-4" />
          Request new card
        </Button>
      </div>

      {availableAccounts.length === 0 && cards.length > 0 && (
        <p className="mb-6 text-xs text-muted">
          All your accounts already have a card. Delete a card to request a new one for that account.
        </p>
      )}

      {cards.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border bg-surface text-center">
          <p className="text-sm text-muted">
            No cards yet — request a virtual or physical card to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <CardVisual
              key={card._id}
              card={card}
              onToggleFreeze={handleToggleFreeze}
              onDelete={handleDeleteCard}
            />
          ))}
        </div>
      )}

      {showModal && (
        <CardRequestModal
          accounts={availableAccounts}
          onClose={() => setShowModal(false)}
          onSuccess={(newCard) => {
            setCards((prev) => [newCard, ...prev]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}