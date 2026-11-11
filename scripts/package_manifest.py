"""Complete code/runtime plus current closure evidence; archived evidence stays in Git and its original ZIP."""
def source_files(paths,phase):
 current='docs/evidence/'+phase.lower().replace('_','-')+'/'
 return [name for name in paths if not name.startswith('entregables/') and not (phase.startswith('CIERRE_') and name.startswith('docs/evidence/') and not name.startswith(current))]
