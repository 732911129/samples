import re

instance_id_regex = re.compile( r"new$" )

class Binder( object ):
  next_select_value = None

  def remove_attrs( self, attr_name, attrs ):
    to_remove = []
    for index, attr in enumerate( attrs ):
      if attr[ 0 ] == attr_name:
        to_remove.append( index )
    for index in to_remove:
      del attrs[ index ]

  def bind_data( self, tag, attrs, 
                  next_data = None, next_select_value = None ):
    if next_select_value:
      self.next_select_value = next_select_value
    return tag, attrs, next_data

  def bind_type( self, tag, attrs ):
    if tag == 'input':
      if ( 'type', 'radio' ) in attrs:
        return 'radio'
      else:
        return tag
    elif (
        ( 
            tag == 'ul' or 
            tag == 'ol' or 
            tag == 'dl' 
          ) and 
        ( 'name', 'models' ) in attrs
      ):
      return 'collection'
    elif ( 
        tag == 'textarea' or
        tag == 'select' or
        tag == 'option' or
        tag == 'form'
      ):
      return tag
    else:
      return None

  def requested_bind_name( self, attrs ):
    for attr in attrs:
      if attr[ 0 ] == 'name':
        return attr[ 1 ]
    return None

  def model_can_bind( self, bind_name, model ):
    try:
      return model.hasslot( bind_name )
    except:
      return False

  def try_bind( self, parser, tag, attrs, model ):
    bind_type = self.bind_type( tag, attrs )
    if not bind_type:
      return None
    bind_name = self.requested_bind_name( attrs )
    if bind_name:
      model_can_bind = self.model_can_bind( bind_name, model )
    if bind_name and model and not model_can_bind:
      print model
      raise TypeError( 'Model can not bind %s' % bind_name )
    else:
      return self.__getattribute__( 'bind_' + bind_type )( parser, tag, attrs, model, bind_name )

  def bind_input( self, parser, tag, attrs, model, bind_name ):
    if model:
      model_value = model.getslot( bind_name )
      self.remove_attrs( 'value', attrs )
      attrs.append( ( 'value', model_value ) )
    return self.bind_data( tag, attrs )

  def bind_select( self, parser, tag, attrs, model, bind_name ):
    model_value = None
    if model:
      model_value = model.getslot( bind_name )
    return self.bind_data( tag, attrs, next_select_value = model_value )

  def bind_option( self, parser, tag, attrs, model, bind_name ):
    option_value = parser.get_attribute_value( 'value', attrs )
    if self.next_select_value and option_value == self.next_select_value:
      attrs.append( ( 'selected', ) )
      print attrs
    return self.bind_data( tag, attrs )

  def bind_textarea( self, parser, tag, attrs, model, bind_name ):
    model_value = None
    if model:
      model_value = model.getslot( bind_name )
    return self.bind_data( tag, attrs, next_data = model_value )

  def bind_radio( self, parser, tag, attrs, model, bind_name ):
    if model:
      radio_value = parser.get_attribute_value( 'value', attrs ) 
      model_value = model.getslot( bind_name )
      if radio_value == model_value:
        attrs.append( ( 'checked', ) )
        print attrs
    return self.bind_data( tag, attrs )

  def bind_form( self, parser, tag, attrs, model, bind_name ):
    if model:
      action_value = parser.get_attribute_value( 'action', attrs ) or ''
      model_key_id = model.getslot( 'key_id' )
      if model_key_id:
        transformed_action_value = instance_id_regex.sub( model_key_id, action_value )
        self.remove_attrs( 'action', attrs )
        attrs.append( ( 'action', transformed_action_value ) )
    return self.bind_data( tag, attrs )

  def bind_collection( self, parser, tag, attrs, model, bind_name ):
    bind_data = []
    if model:
      models = model.models  
      media_type = model.media_type + '-summary'
      tag = 'iframe'
      endtag = '/iframe'
      for instance_key in model.models:
        name_attr = ( 'name', model.media_type ) 
        src_attr = ( 'src', '/api/media/type/%(media_type)s/id/%(key_id)s/' % 
            {
              'key_id' : instance_key.id(),
              'media_type' : media_type 
            } 
          )
        bind_data.append( self.bind_data( tag, [ name_attr, src_attr ] ) ) 
        bind_data.append( self.bind_data( endtag, [] ) )   

    return bind_data
       
