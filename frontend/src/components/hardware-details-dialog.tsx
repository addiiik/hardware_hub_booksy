import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HardwareItem } from "@/types/hardware"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HardwareNoteForm } from "@/components/hardware-note-form"

interface HardwareDetailsDialogProps {
  item: HardwareItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRefresh?: () => void
}

export function HardwareDetailsDialog({ item, open, onOpenChange, onRefresh }: HardwareDetailsDialogProps) {
  if (!item) return null

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl min-h-[80vh] max-h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl">{item.name}</DialogTitle>
            <DialogDescription>
              Hardware ID: {item.id}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden mt-2">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="notes">Notes ({item.notes?.length || 0})</TabsTrigger>
              <TabsTrigger value="rentals">Rentals ({item.rentals?.length || 0})</TabsTrigger>
              <TabsTrigger value="repairs">Repairs ({item.repairs?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-y-auto pt-4">
              <div className="grid grid-cols-2 gap-6 bg-muted/30 p-6 rounded-lg border">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Serial Number</p>
                  <p className="font-medium">{item.serial_number}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Brand</p>
                  <p className="font-medium">{item.brand || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Category</p>
                  <p className="font-medium">{item.category}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Current Status</p>
                  <p className="font-medium">{item.status}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Purchase Date</p>
                  <p className="font-medium">
                    {item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Is Rentable?</p>
                  <p className="font-medium">{item.rentable ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Added to System</p>
                  <p className="font-medium">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </TabsContent>

          <TabsContent value="notes" className="flex-1 flex flex-col overflow-hidden pt-4 space-y-4">
            <HardwareNoteForm itemId={item.id} onSuccess={onRefresh} />

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 border-t pt-3">
              {item.notes && item.notes.length > 0 ? (
                item.notes.map((note) => (
                  <div key={note.id} className="bg-muted/50 p-4 rounded-md text-sm border min-w-0">
                    <div className="flex justify-between items-center text-muted-foreground mb-2 text-xs gap-2">
                      <Tooltip>
                        <TooltipTrigger className="cursor-help underline decoration-dotted font-medium text-foreground truncate">
                          {note.author.first_name} {note.author.last_name}
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{note.author.email}</p>
                        </TooltipContent>
                      </Tooltip>
                      <span className="shrink-0">{new Date(note.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap wrap-break-word">
                      {note.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No notes found for this item.</p>
              )}
            </div>
          </TabsContent>

            <TabsContent value="rentals" className="flex-1 overflow-y-auto pt-4">
               {item.rentals && item.rentals.length > 0 ? (
                  <div className="space-y-2 pr-2">
                    {item.rentals.map((rental) => (
                      <div key={rental.id} className="flex justify-between items-center bg-muted/50 p-3 rounded-md text-sm border">
                         <div>
                           <Tooltip>
                             <TooltipTrigger className="cursor-help underline decoration-dotted font-medium">
                               {rental.user.first_name} {rental.user.last_name}
                             </TooltipTrigger>
                             <TooltipContent side="top">
                               <p>{rental.user.email}</p>
                             </TooltipContent>
                           </Tooltip>
                         </div>
                         <div className="text-right text-muted-foreground text-xs">
                           <div>Rented: {new Date(rental.rented_at).toLocaleDateString()}</div>
                           <div className={!rental.returned_at ? "text-primary font-medium" : ""}>
                             Returned: {rental.returned_at ? new Date(rental.returned_at).toLocaleDateString() : "Active"}
                           </div>
                         </div>
                      </div>
                    ))}
                  </div>
               ) : (
                 <p className="text-muted-foreground text-sm text-center py-8">No rental history found.</p>
               )}
            </TabsContent>

            <TabsContent value="repairs" className="flex-1 overflow-y-auto pt-4">
               {item.repairs && item.repairs.length > 0 ? (
                  <div className="space-y-2 pr-2">
                    {item.repairs.map((repair, index) => (
                      <div key={repair.id} className="flex justify-between items-center bg-muted/50 p-3 rounded-md text-sm border">
                         <span className="font-medium">Repair #{index + 1}</span>
                         <div className="text-right text-muted-foreground text-xs">
                           <div>Started: {new Date(repair.repair_start_date).toLocaleDateString()}</div>
                           <div className={!repair.repair_end_date ? "text-primary font-medium" : ""}>
                             Finished: {repair.repair_end_date ? new Date(repair.repair_end_date).toLocaleDateString() : "In Progress"}
                           </div>
                         </div>
                      </div>
                    ))}
                  </div>
               ) : (
                 <p className="text-muted-foreground text-sm text-center py-8">No repair history found.</p>
               )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}