# Auto-Scan Component Registry Test

The ComponentRegistry.vue now auto-scans all .vue files in subdirectories and categorizes them by folder name.

## How it works:

1. **Folder Structure**: Components are organized in category folders:
   - `Content/` - Content-related components
   - `Data-Display/` - Data visualization components  
   - `Editors/` - Editor components
   - `Programming/` - Programming-related components
   - `Dashboards/` - Dashboard components
   - `Roadmaps/` - Roadmap components

2. **Auto-Discovery**: Uses `import.meta.glob('./*/*.vue', { eager: true })` to automatically import all Vue components from subdirectories.

3. **Auto-Naming**: 
   - Category name comes from folder name (dashes converted to spaces)
   - Component name comes from file name (CamelCase converted to readable text)

4. **Benefits**:
   - No manual imports needed
   - Add new components by just placing them in the right folder
   - Automatic categorization
   - Sorted alphabetically by category then name

## To add a new component:
1. Create your .vue file
2. Place it in the appropriate category folder
3. It will automatically appear in the registry!

Example: Adding `MyCoolFeature.vue` to `Content/` folder will appear as:
- Name: "My Cool Feature"  
- Category: "Content"