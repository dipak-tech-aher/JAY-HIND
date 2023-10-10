// import React, { useEffect, useRef, useState } from "react";
// import Modal from 'react-modal';
// // import Modal from 'react-bootstrap/Modal';
// import { toast } from "react-toastify";
// import { properties } from "../../properties";
// import { post, put, get } from "../../common/util/restUtil";
// import UnitOverview from "./unitOverview";
// import DepartmentMapping from "./DepartmentMapping"

// import { Tree, TreeNode } from "react-organizational-chart";
// import _ from "lodash";
// import clsx from "clsx";
// import Card from "@mui/material/Card";
// import CardContent from "@mui/material/CardContent";
// import CardHeader from "@mui/material/CardHeader";
// import Typography from "@mui/material/Typography";
// import Box from "@mui/material/Box";
// import IconButton from "@mui/material/IconButton";
// import BusinessIcon from "@mui/icons-material/Business";
// import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import Avatar from "@mui/material/Avatar";
// import Menu from "@mui/material/Menu";
// import MenuItem from "@mui/material/MenuItem";
// import ListItemIcon from "@mui/material/ListItemIcon";
// import ListItemText from "@mui/material/ListItemText";
// import Badge from "@mui/material/Badge";
// import Tooltip from "@mui/material/Tooltip";
// import { DndProvider, useDrag, useDrop } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";
// // import organization from "./org.json";
// import { makeStyles } from "@mui/styles";
// import { createTheme, ThemeProvider } from "@mui/material/styles";
// // Modal.setAppElement('body');
// import { MultiSelect } from "react-multi-select-component";
// import Select from 'react-select'

// export default function OrgHierarchyNew(props) {
//     const [refreshTree, setRefreshTree] = useState(false)
//     const [organization, setOrganization] = useState([])
//     const [roleData, setRoleData] = useState([]);
//     const [selectedRoleData, setSelectedRoleData] = useState();
//     const [deptRoles, setDeptRoles] = useState([])
//     const [selectedRoles, setSelectedRoles] = useState({});
    
//     const [mode, setMode] = useState()
//     const [unit, setUnit] = useState();    
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isRoleModalOpen, setIsRoleModalOpen] = useState(false); 
// useEffect(() => {
  
//   let finalObj = {}
//   const finalArr = [], orgArr=[], ouArr=[], deptArr=[], roles=[]
//   get(properties.ORGANIZATION+'/search')
//       .then(resp => {
//           if (resp && resp.data && resp.data.length > 0) {
//               // setOrganization(resp.data)
//               setRefreshTree(false)                  
//               resp.data.map(e => { 
//                   if (e.unitType === 'ORG' && e.status === 'AC') {
//                       orgArr.push(e)
//                   }
//                   else if (e.unitType === 'OU' && e.status === 'AC') {
//                       ouArr.push(e)
//                   }
//                   else if (e.unitType === 'DEPT' && e.status === 'AC') {
//                       deptArr.push(e)
//                   }
//               })
              
//               get(`${properties.ROLE_API}`).then(resp => {
//                 if (resp.data) {
//                     resp.data.map((role) => {
//                         roles.push({ "id": role.roleId, "label": role.roleName, "value": role.roleDesc })
//                     }) 
//                     const val=[]
//                     roles.map((col, i)=>{
//                                     const obj={
//                                         label: col.label,
//                                         value: col.id
//                                     }
//                                     val.push(obj)            
//                                 })
//                     setRoleData(roles)

//                     for (const org of orgArr) {
//                       finalArr.push({
//                             entityName: org.unitName,
//                             entityDesc: org.unitDesc,
//                             addUnitTypeDesc: 'Operational Unit',
//                             addUnitType: 'OU',
//                             editUnitTypeDesc: 'Organization',
//                             editUnitType: org.unitType,
//                             entityId: org.unitId,
//                             addParentEntity: org.unitId,
//                             editParentEntity: org.parentUnit,
//                             mappingPayload: org.mappingPayload,
//                             organizationChildRelationship: ouArr.filter(f => f.parentUnit === org.unitId).map(m => (
//                                 { 
//                                     entityName: m.unitName,
//                                     entityDesc: m.unitDesc,
//                                     addUnitTypeDesc: 'Department',
//                                     addUnitType: 'DEPT',
//                                     editUnitTypeDesc: 'Operational Unit',
//                                     editUnitType: m.unitType,
//                                     entityId: m.unitId,
//                                     addParentEntity: m.unitType,
//                                     editParentEntity: m.parentUnit,
//                                     mappingPayload: m.mappingPayload,
//                                     organizationChildRelationship: deptArr.filter(f => (f.parentUnit === m.unitId)).map(d => ({
//                                         entityName: d.unitName,
//                                         entityDesc: d.unitDesc,
//                                         addUnitTypeDesc: 'Role',
//                                         addUnitType: 'ROLE',
//                                         editUnitType: d.unitType,
//                                         editUnitTypeDesc: 'Department',
//                                         entityId: d.unitId,
//                                         addParentEntity: d.unitType,
//                                         editParentEntity: d.parentUnit,
//                                         mappingPayload: d.mappingPayload,
//                                         roles: roles.filter(f => (d.mappingPayload?.unitroleMapping && d.mappingPayload?.unitroleMapping?.includes(f.id))).map(r => ({
//                                           entityName: r.label,
//                                           entityDesc: r.value,
//                                           entityId: r.id
//                                         }))
//                                     }))
//                                 }
//                             ))
//                         })
//                     }
//                     finalObj= finalArr[0]                       
//                     console.log('orgObj ', finalObj)
//                     setOrganization(finalObj)
//                 }
//             }).finally()
//             console.log('orgArr==', orgArr)
            
//           }
//       }).finally();
  
  
// }, [refreshTree]);
    
// const handleChange = (selectedOptions) => {
// let roles = [];
// if (selectedOptions.length > 0) {
//     selectedOptions.map(item => {
//     roles.push(item.id)
//     });
// }
// setSelectedRoles(roles);
// setDeptRoles(selectedOptions)        
// }
    
// const useStyles = makeStyles((theme) => ({
//   root: {
//     background: "white",
//     display: "inline-block",
//     borderRadius: 16
//   },
//   expand: {
//     transform: "rotate(0deg)",
//     marginTop: -10,
//     marginLeft: "auto",
//     transition: theme.transitions.create("transform", {
//       duration: theme.transitions.duration.short
//     })
//   },
//   expandOpen: {
//     transform: "rotate(180deg)"
//   },
//   avatar: {
//     backgroundColor: "#ECECF4"
//   }
// }));
//     const handleSubmit = () => {
//     // let error
//     // error = validate(unitDetailsValidationSchema, unit);
//     // if (error) {
//     //     toast.error("Validation errors found. Please check highlighted fields");
//     //     return false;
//     // }
//     let data
//     if (mode === 'new') {
//         data = {
//             unitId: unit.unitId,
//             unitName: unit.unitName,
//             unitDesc: unit.unitDesc,
//             unitType: unit.unitType,
//             parentUnit: unit.parentUnit,
//             mappingPayload: unit.mappingPayload    
//         }
//     } else {
//         data = {
//             unitId: unit.unitId,
//             unitName: unit.unitName,
//             unitDesc: unit.unitDesc,
//             unitType: unit.unitType,
//             parentUnit: unit.parentUnit,
//             mappingPayload: unit.mappingPayload       
//         }
//     }

    
//     if (mode === 'new') {
//         post(properties.ORGANIZATION+'/create', data)
//             .then((resp) => {
//                 if (resp) {
//                     if (resp.status === 200) {
//                         toast.success(resp.message);
//                       setRefreshTree(true)
//                     } 
//                 } 
//             }).finally();
//     } else {
//         put(properties.ORGANIZATION + "/update/" + unit.unitId, data)
//             .then((resp) => {
//                 if (resp) {
//                     if (resp.status === 200) {
//                         toast.success(resp.message);
//                       setRefreshTree(true)
//                     }
//                 } 
//             }).finally();
//     }
//   }
    
//   const handleRoleSubmit = () => {
//         console.log('data is ', selectedRoleData)  
//     let data = {
//         unitId: selectedRoleData.entityId,
//         unitName: selectedRoleData.entityName,
//         unitDesc: selectedRoleData.entityDesc,
//         unitType: selectedRoleData.editUnitType,
//         parentUnit: selectedRoleData.editParentEntity
//     }
//     data['mappingPayload'] = { "unitroleMapping": selectedRoles }    
    
//     put(properties.ORGANIZATION + "/update/" + selectedRoleData.entityId, data)
//       .then((resp) => {
//         if (resp.status === 200) {
//             toast.success(resp.message);
//             setRefreshTree(true)
//         }
//       })
//       .catch((error) => {
//         console.error(error)
//       })
//       .finally();
//     }
//     const handleClose = () => {   
//       setIsModalOpen(false);
//       setIsRoleModalOpen(false);
//     };
// function ParentNode({ org, onCollapse, collapsed }) {
//     const classes = useStyles();
//     const [anchorEl, setAnchorEl] = useState(null); 

//     const handleClick = (event) => {
//       setAnchorEl(event.currentTarget);      
//     };

//   const handleClose = () => {
//       setAnchorEl(null);
//       setIsModalOpen(false);
//       setIsRoleModalOpen(false);
//     };

//   const handleAddModalOpen = () => {
//     setMode('new')
//     setUnit({
//       unitName: "",
//       unitDesc: "",
//       unitType: org.addUnitType || "",
//       parentUnit: org.entityId || "",
//       unitId: org.entityId,
//       mappingPayload: [{}], 
//     })
//     if (org.addUnitType === 'ROLE') {
//     setIsRoleModalOpen(true)
//     }else{
//     setIsModalOpen(true);  
//     }
//   };

//   const handleEditModalOpen = () => {
//     setMode('edit')    
//     setUnit({
//       unitId: org.entityId || "",
//       unitName: org.entityName || "",
//       unitDesc: org.entityDesc || "",
//       unitType: org.editUnitType || "",
//       parentUnit: org.editParentEntity || "",
//       mappingPayload: org.mappingPayload || {}, 
//     })
//     if (org.addUnitType === 'ROLE') {
//         setIsRoleModalOpen(true)
//       }else{
//         setIsModalOpen(true);  
//       }
//   };

 

//   const handleSubmit = () => {
//     // let error
//     // error = validate(unitDetailsValidationSchema, unit);
//     // if (error) {
//     //     toast.error("Validation errors found. Please check highlighted fields");
//     //     return false;
//     // }
//     let data
//     if (mode === 'new') {
//         data = {
//             unitId: unit.unitId,
//             unitName: unit.unitName,
//             unitDesc: unit.unitDesc,
//             unitType: unit.unitType,
//             parentUnit: unit.parentUnit,
//             mappingPayload: unit.mappingPayload    
//         }
//     } else {
//         data = {
//             unitId: unit.unitId,
//             unitName: unit.unitName,
//             unitDesc: unit.unitDesc,
//             unitType: unit.unitType,
//             parentUnit: unit.parentUnit,
//             mappingPayload: unit.mappingPayload       
//         }
//     }

    
//     if (mode === 'new') {
//         post(properties.ORGANIZATION+'/create', data)
//             .then((resp) => {
//                 if (resp) {
//                     if (resp.status === 200) {
//                         toast.success(resp.message);
//                       setRefreshTree(true)
//                     } 
//                 } 
//             }).finally();
//     } else {
//         put(properties.ORGANIZATION + "/update/" + unit.unitId, data)
//             .then((resp) => {
//                 if (resp) {
//                     if (resp.status === 200) {
//                         toast.success(resp.message);
//                       setRefreshTree(true)
//                     }
//                 } 
//             }).finally();
//     }
//   }
    
//   const handleRoleSubmit = () => {
//         console.log('data is ', selectedRoleData)  
//     let data = {
//         unitId: selectedRoleData.entityId,
//         unitName: selectedRoleData.entityName,
//         unitDesc: selectedRoleData.entityDesc,
//         unitType: selectedRoleData.editUnitType,
//         parentUnit: selectedRoleData.editParentEntity
//     }
//     data['mappingPayload'] = { "unitroleMapping": selectedRoles }    
    
//     put(properties.ORGANIZATION + "/update/" + selectedRoleData.entityId, data)
//       .then((resp) => {
//         if (resp.status === 200) {
//             toast.success(resp.message);
//             setRefreshTree(true)
//         }
//       })
//       .catch((error) => {
//         console.error(error)
//       })
//       .finally();
//   }
//   let backgroundColor = "white";
//   return (
//     <Card
//       variant="outlined"
//       className={classes.root}
//      // ref={drop}
//       style={{ backgroundColor }}
//     >
//       <CardHeader
//         avatar={
//           <Tooltip
//             title={`${_.size(
//               org.organizationChildRelationship
//             )} ${_.size(org.roles)}`}
//             arrow
//           >
//             <Badge
//               style={{ cursor: "pointer" }}
//               color="secondary"
//               anchorOrigin={{
//                 vertical: "bottom",
//                 horizontal: "right"
//               }}
//               showZero
//               invisible={!collapsed}
//               overlap="circle"
//               badgeContent={_.size(org.organizationChildRelationship)}
//               onClick={onCollapse}
//             >
//               <Avatar className={classes.avatar}>
//                 <BusinessIcon color="primary" />
//               </Avatar>
//             </Badge>
//           </Tooltip>
//         }
//         title={org.entityName}
//         action={
//             <IconButton size="small" onClick={handleClick}>
//             <MoreVertIcon />
//           </IconButton>
//         }
//           />
//         <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose} >
//           <MenuItem style={{background: backgroundColor, display: `${(isModalOpen || isRoleModalOpen) ? 'none': 'block'}`}}> 
//                   <MenuItem onClick={handleAddModalOpen}>
//               <ListItemIcon>
//                 <BusinessIcon color="primary" />
//               </ListItemIcon>
//               <ListItemText primary={`Add ${org.addUnitTypeDesc}`} />                  
//             </MenuItem>
//             <MenuItem />
//                   <MenuItem onClick={handleEditModalOpen} >
//               <ListItemIcon>
//                 <BusinessIcon color="secondary" />
//               </ListItemIcon>
//               <ListItemText primary={`Edit ${org.editUnitTypeDesc}`} />                  
//             </MenuItem>   
//               </MenuItem>            
//         </Menu>
//           <Modal open={true}>
//                 <div style={{ display: `${isModalOpen ? 'block': 'none'}`, marginTop:"-35px", marginBottom: "-35px"}}>
                            
//                     <fieldset>
//                     <div className="row">
//                         <div className="col-md-5">
//                             <div className="form-group">
//                                 <label className="control-label">Unit Name</label>                                                               
//                                 <input type="text" className="form-control" placeholder="Unit Name"
//                                     data-test="unitName"
//                                     value={unit?.unitName}
//                                     onChange={(e) => {
//                                         setUnit({ ...unit, unitName: e.target.value });
//                                     }}
//                                 />
//                             </div>
//                         </div>
//                         <div className="col-md-5">
//                             <div className="form-group">
//                                 <label className="control-label">Unit Description</label>                                
//                                 <input type="text" className="form-control" placeholder="Unit Description"
//                                     data-test="unitDesc"
//                                     value={unit?.unitDesc}
//                                     onChange={(e) => {
//                                         setUnit({ ...unit, unitDesc: e.target.value });
//                                     }}                                      
//                                 /> 
//                             </div>
//                         </div>
//                     </div>
//                     </fieldset >
                
//                     <div className="d-flex justify-content-center">
//                     <button className="skel-btn-cancel" onClick={handleClose}>Close</button>
//                     <button className="skel-btn-submit" onClick={handleSubmit}>Save changes</button>
//                     </div>                  
            
//                 </div>
//                 <div style={{ display: `${isRoleModalOpen ? 'block' : 'none'}`, marginTop: "-35px", marginBottom: "-35px" }}>
            
//                     <fieldset>                    
//                         <div className="" style={{ width: '600px' }}>
//                         <label className="control-label">Roles&nbsp;<span className="text-danger">*</span></label>                                    
//                         { deptRoles &&
//                             <Select
//                                 closeMenuOnSelect={false}

//                                 menuPortalTarget={document.body} 
//                                 styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                
//                                 defaultValue={deptRoles.length === 0 ? [] : deptRoles}
//                                 value={deptRoles}
//                                 options={roleData}
//                                 getOptionLabel={option => `${option.label}: ${option.value}`}
//                                 onChange={handleChange}
//                                 isMulti
//                                 isClearable
//                                 name="roles"
//                             />
//                         }   
//                     </div>                     
//                     </fieldset >
                
//                     <div className="d-flex justify-content-center">
//                     <button className="skel-btn-cancel" onClick={handleClose}>Close</button>
//                     <button className="skel-btn-submit" onClick={handleRoleSubmit}>Save changes</button>
//                     </div>                  
                
//                 </div>
//             </Modal>
//       <IconButton
//         size="small"
//         onClick={onCollapse}
//         className={clsx(classes.expand, {
//           [classes.expandOpen]: !collapsed
//         })}
//       >
//         <ExpandMoreIcon />
//       </IconButton>
//     </Card>
//   );
// }
// function Child({ a }) {
//   const classes = useStyles();
// //   const [{ isDragging }, drag] = useDrag({
// //     item: { name: a.name, type: "account" },
// //     end: (item, monitor) => {
// //       const dropResult = monitor.getDropResult();
// //       if (item && dropResult) {
// //         alert(`You moved ${item.name} to ${dropResult.name}`);
// //       }
// //     },
// //     collect: (monitor) => ({
// //       isDragging: monitor.isDragging()
// //     })
// //   });
//   const opacity = 1;
//   return (
//     <Card
//       variant="outlined"
//       className={classes.root}
//       //ref={drag}
//       style={{ cursor: "pointer", opacity }}
//     >
//       <CardHeader
//         avatar={
//           <Avatar className={classes.avatar}>
//             <AccountBalanceIcon color="secondary" />
//           </Avatar>
//         }
//         title={a.name}
//       />
//     </Card>
//   );
// }
    
// function FinalNode({ p }) {
//     const classes = useStyles();
//     return (        
//         <Card variant="outlined" className={classes.root}>
//         <CardContent>
//             <Typography variant="subtitle2">{p.entityName}</Typography>
//         </CardContent>
//         </Card>
//     );
// }
// function Node({ o, parent }) {
//   const [collapsed, setCollapsed] = useState(o.collapsed);
//   const handleCollapse = () => {
//     setCollapsed(!collapsed);
//   };
//   useEffect(() => {
//     o.collapsed = collapsed;
//   });
//   const T = parent
//     ? TreeNode
//     : (props) => (
//         <Tree
//           {...props}
//           lineWidth={"2px"}
//           lineColor={"#bbc"}
//           lineBorderRadius={"12px"}
//         >
//           {props.children}
//         </Tree>
//       );
//   return collapsed ? (
//     <T
//       label={
//         <ParentNode
//           org={o}
//           onCollapse={handleCollapse}
//           collapsed={collapsed}
//         />
//       }
//     />
//   ) : (
//     <T
//       label={
//         <ParentNode
//           org={o}
//           onCollapse={handleCollapse}
//           collapsed={collapsed}
//         />
//       }
//     >
//       {_.map(o.roles, (a) => (
//           <TreeNode label={<FinalNode p={a} />}> 
//           {/* <TreeNode label={<FinalNode p={a.role} />} /> */}
//         </TreeNode>
//       ))}
//       {_.map(o.organizationChildRelationship, (c) => (
//         <Node o={c} parent={o} />
//       ))}
//     </T>
//   );
// }
// const theme = createTheme({
//   palette: {
//     background: "#ECECF4"
//   },
//   fontFamily: "Roboto, sans-serif"
// });


//   return (
//     <ThemeProvider theme={theme}>
//       <Box bgcolor="background" padding={4} height="80vh">
//               <DndProvider backend={HTML5Backend}>                  
//                   <Node o={organization} />
                 
//             </DndProvider>
//           </Box>           
//       </ThemeProvider>
//   );
// }