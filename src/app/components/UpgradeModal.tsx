import { Sparkles, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { useSubscription } from "../subscription";

// Global modal shown when a gated AI call is rejected (TrialExpiredError).
export function UpgradeModal({ onGoToBilling }: { onGoToBilling: () => void }) {
  const { upgradeModalOpen, closeUpgradeModal } = useSubscription();

  return (
    <Dialog open={upgradeModalOpen} onOpenChange={(o) => !o && closeUpgradeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
            <Lock className="size-6" />
          </div>
          <DialogTitle>Your free trial has ended</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          AI features like lead scoring, email drafting and call summaries need an active subscription. Upgrade to
          pick up right where you left off.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={closeUpgradeModal}>Not now</Button>
          <Button
            onClick={() => {
              closeUpgradeModal();
              onGoToBilling();
            }}
          >
            <Sparkles className="size-4" /> View plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
