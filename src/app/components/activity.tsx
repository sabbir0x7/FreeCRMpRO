import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useStore, uid, type Activity, type Contact } from "../store";
import { toast } from "sonner";

const types: Activity["type"][] = ["note", "email", "call", "meeting"];

export function LogActivityDialog({ contact, trigger }: { contact: Contact; trigger: React.ReactNode }) {
  const { dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Activity["type"]>("note");
  const [text, setText] = useState("");

  function submit() {
    if (!text.trim()) return;
    dispatch({
      type: "contact/activity",
      id: contact.id,
      activity: { id: uid(), type, text: text.trim(), at: Date.now() },
    });
    toast.success("Activity logged");
    setText("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log activity · {contact.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as Activity["type"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Details</Label>
            <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="What happened?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Log activity</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
